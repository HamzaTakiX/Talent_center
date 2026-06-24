import { FunctionComponent } from 'react';

const SKELETON_WIDTHS = ['88%', '72%', '80%', '64%'];

const CareerCoachSidebarSkeleton: FunctionComponent = () => (
  <ul className="sr-acc-sidebar__conversations sr-acc-sidebar__conversations--loading" aria-hidden>
    {SKELETON_WIDTHS.map((width) => (
      <li key={width} className="sr-acc-sidebar__skeleton-row">
        <span className="sr-acc-sidebar__skeleton-line" style={{ width }} />
      </li>
    ))}
  </ul>
);

export default CareerCoachSidebarSkeleton;
