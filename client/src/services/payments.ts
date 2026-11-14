import api from '@/lib/api';
import type { ApiResponse, PaymentResult, SimulatedPaymentOutcome } from '@/types';

export interface PaymentRequest {
  orderId: string;
  outcome: SimulatedPaymentOutcome;
  idempotencyKey: string;
}

export const paymentService = {
  processPayment({ orderId, outcome, idempotencyKey }: PaymentRequest) {
    return api.post<unknown, ApiResponse<PaymentResult>>(
      `/orders/${orderId}/payments`,
      { outcome },
      { headers: { 'Idempotency-Key': idempotencyKey } },
    );
  },
};
