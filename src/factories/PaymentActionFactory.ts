import {
  FullPaymentActionStrategy,
  PartialPaymentActionStrategy,
  AdvancePaymentActionStrategy,
  AbsentPaymentActionStrategy
} from '../strategies/PaymentActionStrategies';
import type { IPaymentActionStrategy } from '../types/strategies';

export class PaymentActionFactory {
  static createStrategy(status: 'paid' | 'partial' | 'advance' | 'absent', isOverpayment: boolean = false): IPaymentActionStrategy {
    switch (status) {
      case 'advance':
        if (isOverpayment) return new AdvancePaymentActionStrategy();
        return new FullPaymentActionStrategy(); // If they selected advance but amount isn't overpayment
      case 'partial':
        return new PartialPaymentActionStrategy();
      case 'absent':
        return new AbsentPaymentActionStrategy();
      case 'paid':
      default:
        // By default, assume a full payment unless partial is explicitly stated
        return new FullPaymentActionStrategy();
    }
  }
}
