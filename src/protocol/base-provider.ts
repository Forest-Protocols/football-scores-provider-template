import {
  addressSchema,
  Agreement,
  PipeMethod,
  PipeResponseCode,
  validateBodyOrParams,
} from "@forest-protocols/sdk";
import { AbstractProvider } from "@/abstract/AbstractProvider";
import { Resource, ResourceDetails } from "@/types";
import { z } from "zod";
import { Address } from "viem";
import { nonEmptyStringSchema } from "@/validation/schemas";

// Define the challenge schema
const challengeSchema = z.object({
  challengeId: z.string().uuid(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  venue: z.string(),
  league: z.string(),
  fixtureId: z.number(),
  kickoffTime: z.string().datetime(),
  phaseIdentifier: z.enum(["T7D", "T36H", "T12H", "T1H", "T1M"]),
  targetMarket: z.literal("1X2"),
  difficulty: z.number(),
  deadline: z.string().datetime()
});

/**
 * Defines the structure of details stored for each created Resource.
 * Contains both public and private information about the resource.
 * @responsible Protocol Owner
 * @property Example_Detail - A numeric value representing [describe purpose]
 * @property _examplePrivateDetailWontSentToUser - Internal data not exposed to users
 */
export type ScorePredictionResourceDetails = ResourceDetails & {
  Predictions_Allowance_Count: number;
  Predictions_Count: number;
};

/**
 * Abstract base class defining required actions for this Protocol implementation.
 * All Protocol providers must extend this class and implement its abstract methods.
 * @responsible Protocol Owner
 * @abstract
 * @template ScorePredictionResourceDetails - Type defining resource details structure
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
  ): Promise<{ predictions: string; responseCode: PipeResponseCode }>;

  async init(providerTag: string) {
    // Base class' `init` function must be called.
    await super.init(providerTag);

    /** Calls "predictFixtureResults" method. */
    this.route(PipeMethod.GET, "/predict-fixture-results", async (req) => {
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

      // Call the actual method logic and retrieve the results.
      const result = await this.predictFixtureResults(
        agreement,
        resource,
        body.challenges
      );

      // Return the response with the results.
      return {
        code: PipeResponseCode.OK,
        body: result.predictions,
      };
    });
  }
}
