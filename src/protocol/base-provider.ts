import {
  addressSchema,
  Agreement,
  PipeError,
  PipeMethods,
  PipeResponseCodes,
  PipeResponseCodeType,
  PromiseQueue,
  tryParseJSON,
  validateBodyOrParams,
} from "@forest-protocols/sdk";
import { AbstractProvider } from "@/abstract/AbstractProvider";
import { Resource, ResourceDetails } from "@/types";
import { z } from "zod";
import { Address } from "viem";
import { nonEmptyStringSchema } from "@/validation/schemas";
import { colorWord } from "@/color";
import { ensureError } from "@/utils/ensure-error";

// Define schemas and types
export const ChallengeSchema = z
  .object({
    challengeId: z.string() /* .uuid() */,
    kickoffTime: z.string(),
    // homeTeam: z.string(),
    // awayTeam: z.string(),
    // venue: z.string(),
    // league: z.string(),
    // fixtureId: z.number(),
    // kickoffTime: z.string().datetime(),
    // phaseIdentifier: z.enum(["T7D", "T36H", "T12H", "T1H", "T1M"]),
    // targetMarket: z.literal("1X2"),
    // difficulty: z.number(),
    // deadline: z.string().datetime(),
  })
  .passthrough();
export type Challenge = z.infer<typeof ChallengeSchema>;

export const PredictionSchema = z
  .object({
    challengeId: z.string() /* .uuid() */,
    prediction: z.object({
      "1X2": z.object({
        home: z.number() /* .min(0).max(1) */,
        draw: z.number() /* .min(0).max(1) */,
        away: z.number() /* .min(0).max(1) */,
      }),
    }),
  })
  .passthrough();
export type Prediction = z.infer<typeof PredictionSchema>;

/**
 * Resource details stored for each Agreement
 */
export type ScorePredictionResourceDetails = ResourceDetails & {
  Predictions_Allowance_Count: number;
  Predictions_Count: number;
};

/**
 * Base class that Providers have to inherit from for their Providers.
 */
export abstract class ScorePredictionServiceProvider extends AbstractProvider<ScorePredictionResourceDetails> {
  // These are network-wide actions defined in `AbstractProvider` from which this class inherits. They have to be implemented by all of the Providers.
  /**
   * abstract create(agreement: Agreement, offer: DetailedOffer): Promise<T>;
   *
   * abstract getDetails(
   *  agreement: Agreement,
   *  offer: DetailedOffer,
   *  resource: Resource
   * ): Promise<T>;
   *
   * abstract delete(
   *  agreement: Agreement,
   *  offer: DetailedOffer,
   *  resource: Resource
   * ): Promise<void>;
   */

  predictionCache: Record<string, Prediction> = {};
  requestQueue = new PromiseQueue({ concurrency: 1 });

  /**
   * Gets a prediction from the cache
   */
  getCachedPrediction(challengeId: string) {
    return this.predictionCache[challengeId] as Prediction | undefined;
  }

  /**
   * Caches a prediction
   */
  cachePrediction(challengeId: string, prediction: Prediction) {
    this.predictionCache[challengeId] = prediction;
  }

  /**
   * Predicts the results of upcoming football fixtures.
   * @param agreement On-chain agreement data.
   * @param resource Resource information stored in the database.
   * @param challenges The challenges to predict the results for (array of stringified json objects)
   * @returns Promise containing the predictions and a response code.
   * @throws {Error} When the operation fails
   */
  abstract predictFixtureResults(
    agreement: Agreement,
    resource: Resource,
    challenges: string
  ): Promise<{ predictions: string; responseCode: PipeResponseCodeType }>;

  async init(providerTag: string) {
    // Base class' `init` function must be called.
    await super.init(providerTag);

    /** Calls "predictFixtureResults" method. */
    this.route(PipeMethods.GET, "/predict-fixture-results", async (req) => {
      /**
       * Validate the params/body of the request. If they are not valid,
       * request will reply back to the user with a validation error message
       * and a 'bad request' code automatically.
       */

      const body = validateBodyOrParams(
        req.body,
        z.object({
          /** ID of the resource. */
          id: z.number(),

          /** Protocol address in which the resource was created. */
          pt: addressSchema, // A pre-defined Zod schema for smart contract addresses.

          /** Argument containing the challenges to predict the results for. */
          challenges: nonEmptyStringSchema,
        })
      );

      const { agreement, resource } = await this.getResource(
        body.id,
        body.pt as Address,
        req.requester
      );

      let challenges = tryParseJSON<Challenge[]>(body.challenges);

      if (!challenges) {
        throw new PipeError(PipeResponseCodes.BAD_REQUEST, {
          message: "Invalid challenges",
        });
      }

      // Validate the challenges
      const validation = z.array(ChallengeSchema).safeParse(challenges);

      if (!validation.success) {
        throw new PipeError(PipeResponseCodes.BAD_REQUEST, {
          message: "Validation failed",
          errors: validation.error.issues,
        });
      }

      challenges = validation.data;

      // Call the actual method logic and retrieve the results.
      // For the sake of the cache, we are processing all the requests sequentially.
      // So upcoming request(s) can use the cached Predictions
      const result = await this.requestQueue.queue({
        fn: async () => {
          // Filter out the predictions that we've already made
          const cachedPredictions: Prediction[] = [];
          const challengesToBeSend: Challenge[] = [];

          for (const challenge of challenges) {
            const prediction = this.getCachedPrediction(challenge.challengeId);
            if (prediction) {
              this.logger.info(
                `Prediction of challenge ${colorWord(
                  challenge.challengeId
                )} is using from cache`
              );
              cachedPredictions.push(prediction);
            } else {
              challengesToBeSend.push(challenge);
            }
          }

          // If there is nothing to be sent to the method (which means
          // all the challenges are already cached) only return the cached predictions
          if (challengesToBeSend.length === 0) {
            this.logger.info(
              `All the challenges are already cached, returning`
            );

            return {
              responseCode: PipeResponseCodes.OK,
              predictions: JSON.stringify(cachedPredictions),
            };
          }

          const stringifiedChallenges = JSON.stringify(challengesToBeSend);
          this.logger.debug(
            `Sending ${challengesToBeSend.length} challenges: ${stringifiedChallenges}`
          );

          try {
            const { responseCode, predictions: stringifiedPredictions } =
              await this.predictFixtureResults(
                agreement,
                resource,
                stringifiedChallenges
              );

            // This is supposed to be an array of Predictions
            // TODO: Maybe also do schema validation?
            const parsedPredictions = tryParseJSON<Prediction[]>(
              stringifiedPredictions
            );

            if (parsedPredictions === undefined) {
              this.logger.error(
                `Prediction is failed: Invalid JSON returned from predictFixtureResults()`
              );
              this.logger.debug(`Invalid JSON: ${stringifiedPredictions}`);
              throw new PipeError(PipeResponseCodes.INTERNAL_SERVER_ERROR, {
                message: "Prediction is failed",
              });
            }

            // Cache the Predictions that we've just made
            for (const prediction of parsedPredictions) {
              this.cachePrediction(prediction.challengeId, prediction);
              this.logger.info(
                `Prediction for challenge ${prediction.challengeId} is cached`
              );
            }

            return {
              responseCode,

              // Combine the predictions that has been made
              // with the cached predictions
              predictions: JSON.stringify([
                ...parsedPredictions,
                ...cachedPredictions,
              ]),
            };
          } catch (err) {
            const error = ensureError(err);
            this.logger.error(`Prediction is failed: ${error.stack}`);
            throw new PipeError(PipeResponseCodes.INTERNAL_SERVER_ERROR, {
              message: "Prediction is failed",
            });
          }
        },
      });

      // Return the response with the results.
      return {
        code: result.responseCode,
        body: result.predictions,
      };
    });
  }
}
