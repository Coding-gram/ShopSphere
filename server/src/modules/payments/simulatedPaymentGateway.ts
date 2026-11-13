export type SimulatedPaymentOutcome = 'success' | 'failure';

export interface SimulatedPaymentRequest {
  amount: number;
  currency: 'INR';
  outcome: SimulatedPaymentOutcome;
}

export type SimulatedPaymentResult =
  | { status: 'succeeded' }
  | { status: 'failed'; failureCode: 'SIMULATED_DECLINED' };

export interface PaymentGateway {
  charge(request: SimulatedPaymentRequest): Promise<SimulatedPaymentResult>;
}

/**
 * A deterministic local gateway for Phase 5.2. It has no credentials, calls no
 * external service, and receives its amount exclusively from the order service.
 */
export const simulatedPaymentGateway: PaymentGateway = {
  async charge({ outcome }: SimulatedPaymentRequest): Promise<SimulatedPaymentResult> {
    return outcome === 'success'
      ? { status: 'succeeded' }
      : { status: 'failed', failureCode: 'SIMULATED_DECLINED' };
  },
};
