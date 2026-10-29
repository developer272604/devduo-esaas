import { getTemplate } from '@/templates';
import { useCartStore } from './cart';
import { useWishlistStore } from './wishlist';
import { useTemplateStore } from './template';
import { useUiStore } from './ui';
import { adapters } from '@/lib/adapters';
import { computeTotals, toPriced, unitPrice } from '@/lib/pricing';
import { FIELD_ORDER, validateCheckout, type CheckoutErrors } from '@/lib/validation';
import { useAuthStore } from './auth';
import { useCheckoutStore } from './checkout';
import { useOrdersStore } from './orders';
import { useCustomize } from './customize';
import { productNameId } from '@/lib/textIds';

/**
 * Switching template swaps the whole catalogue, so cart, wishlist and coupon are
 * cleared. Orders stay (each carries its template id) and the active theme for the
 * new template is whatever was remembered for it, or its default.
 */
export function switchTemplate(id: string, navigate: (href: string) => void): void {
  if (id === useTemplateStore.getState().tpl) return;
  const ui = useUiStore.getState();
  const apply = () => {
    const hadItems = useCartStore.getState().lines.length > 0 || useWishlistStore.getState().ids.length > 0;
    useTemplateStore.getState().setTpl(id);
    useCartStore.getState().clear();
    useWishlistStore.getState().clear();
    navigate('/');
    useUiStore.getState().showToast(`Switched to ${getTemplate(id).name}.${hadItems ? ' Cart and wishlist were cleared.' : ''}`);
  };
  const hasItems = useCartStore.getState().lines.length > 0 || useWishlistStore.getState().ids.length > 0;
  if (hasItems) {
    ui.openModal({
      t: 'confirm',
      title: 'Switch template?',
      text: 'Your cart and wishlist will be cleared because the new template has different products.',
      yes: 'Switch template',
      onYes: apply,
    });
  } else {
    apply();
  }
}

/* ---------- placing an order ---------- */

/** Validates the form. Returns the errors, empty when the form is good to go. */
export function checkCheckout(): CheckoutErrors {
  return validateCheckout(useCheckoutStore.getState().form);
}

export const firstErrorField = (e: CheckoutErrors) => FIELD_ORDER.find((k) => e[k]);

let placing = false;

/**
 * Runs payment through the Devduo Pay adapter, then creates the order, clears the cart and coupon
 * and goes to the success page. Called directly, or after sign-in when the shopper was signed out.
 *
 * A second call while one is running is ignored, so a double click cannot charge twice. If the
 * payment or the order step throws, the dialog closes, the cart stays as it was and the shopper is told.
 */
export async function runPlaceOrder(navigate: (href: string) => void): Promise<void> {
  if (placing) return;
  const tpl = useTemplateStore.getState().tpl;
  const cart = useCartStore.getState();
  const form = useCheckoutStore.getState().form;
  const lines = toPriced(cart.lines, (id) => adapters.catalog.getProduct(tpl, id));
  if (!lines.length) return;
  const totals = computeTotals(lines, { coupon: cart.coupon, speed: form.ship, pay: form.pay });

  placing = true;
  useUiStore.getState().openModal({ t: 'busy', title: 'Processing payment with Devduo Pay', text: 'Please do not close this page.' });
  try {
    const charge = await adapters.payment.charge({
      method: form.pay,
      amount: totals.total,
      upi: form.upi,
      cardLast4: form.card.replace(/\s/g, '').slice(-4),
    });
    if (!charge.ok) {
      useUiStore.setState({ modal: null });
      useUiStore.getState().showToast(charge.error);
      return;
    }
    const order = await adapters.orders.create({
      tpl,
      items: lines.map((l) => ({
        id: l.product.id,
        name: useCustomize.getState().texts[tpl]?.[productNameId(l.product.id)] ?? l.product.name,
        emoji: l.product.emoji,
        opt: l.product.opts ? l.product.opts.values[l.o] ?? '' : '',
        qty: l.qty,
        price: unitPrice(l.product, l.o),
      })),
      totals,
      address: { name: form.name, phone: form.phone, addr: form.addr, city: form.city, pin: form.pin, state: form.state },
      pay: form.pay,
      ship: form.ship,
    });
    useOrdersStore.getState().add(order);
    useCartStore.getState().clear();
    useCheckoutStore.getState().set({ card: '', exp: '', cvv: '' });
    // The busy dialog stays up until the success page is showing (ModalHost closes it), so the emptied cart never flashes.
    navigate(`/success/${order.id}`);
  } catch {
    useUiStore.setState({ modal: null });
    useUiStore.getState().showToast('Something went wrong. You were not charged. Please try again.');
  } finally {
    placing = false;
  }
}

/** Place order button: validate, sign in if needed (then resume), then pay. */
export function placeOrder(navigate: (href: string) => void): CheckoutErrors {
  const errors = checkCheckout();
  if (Object.keys(errors).length) return errors;
  if (!useAuthStore.getState().user) {
    const ui = useUiStore.getState();
    ui.setAfterAuth(() => void runPlaceOrder(navigate));
    ui.openModal({ t: 'auth' });
    return {};
  }
  void runPlaceOrder(navigate);
  return {};
}
