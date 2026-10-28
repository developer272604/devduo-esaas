import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Link as RouterLink } from 'react-router-dom';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

/** Thin wrapper so components keep an `href` prop while routing client-side. */
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, children, ...rest }, ref) {
  return (
    <RouterLink ref={ref} to={href} {...rest}>
      {children}
    </RouterLink>
  );
});

export default Link;
