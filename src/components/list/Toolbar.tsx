import { forwardRef, useId } from 'react';
import { GridIcon, ListIcon } from './icons';
import { SORTS, type Paging, type Sort, type View } from './model';

type Props = {
  paging: Paging;
  view: View;
  sort: Sort;
  onView: (v: View) => void;
  onSort: (s: Sort) => void;
};

export const Toolbar = forwardRef<HTMLDivElement, Props>(function Toolbar({ paging, view, sort, onView, onSort }, ref) {
  const id = useId();
  const { from, to, total } = paging;
  return (
    <div className="cat-tools" ref={ref}>
      <div className="cat-views" role="group" aria-label="Layout">
        <button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} className={view === 'grid' ? 'on' : undefined} onClick={() => onView('grid')}>
          <GridIcon />
        </button>
        <button type="button" aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'on' : undefined} onClick={() => onView('list')}>
          <ListIcon />
        </button>
      </div>
      <p className="cat-count" aria-live="polite" aria-atomic="true">
        {total === 0 ? (
          'No products match'
        ) : (
          <>
            Showing{' '}
            <b>
              {from}–{to}
            </b>{' '}
            of <b>{total}</b> product{total === 1 ? '' : 's'}
          </>
        )}
      </p>
      <label className="cat-sort" htmlFor={`${id}-sort`}>
        <span>Sort by</span>
        <select id={`${id}-sort`} aria-label="Sort by" value={sort} onChange={(e) => onSort(e.target.value as Sort)}>
          {SORTS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
});
