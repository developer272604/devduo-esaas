import { Icon } from '@/components/common/Icon';
import { pageList, type Paging } from './model';

/** Page buttons plus a thin progress bar showing how much of the list has been shown so far. */
export function Pagination({ paging, onPage }: { paging: Paging; onPage: (n: number) => void }) {
  const { page, pages, to, total, shownPct } = paging;
  if (!total) return null;
  return (
    <div className="cat-foot">
      <div className="cat-prog">
        <p>
          Showing {to} of {total} items <b>{shownPct}%</b>
        </p>
        <div className="cat-bar" aria-hidden="true">
          <span style={{ width: `${shownPct}%` }} />
        </div>
      </div>
      {pages > 1 && (
        <nav className="cat-pages" aria-label="Pagination">
          <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            <Icon name="chevronLeft" size={16} />
          </button>
          {pageList(page, pages).map((n, i) =>
            n === 'gap' ? (
              <span key={`gap${i}`} className="cat-gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button key={n} type="button" aria-label={`Page ${n}`} aria-current={n === page ? 'page' : undefined} className={n === page ? 'on' : undefined} onClick={() => onPage(n)}>
                {n}
              </button>
            ),
          )}
          <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            <Icon name="chevronRight" size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
