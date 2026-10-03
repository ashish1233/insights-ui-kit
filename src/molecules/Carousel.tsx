import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { cx } from '../utils/cx';
import styles from './Carousel.module.css';

export interface CarouselItem {
  id: string;
  /**
   * Announced as the slide's name — "2 of 4: Warehouse migration window". Use
   * the slide's own title; a reader who has paged past something needs to
   * recognise it, not be told it is a slide.
   */
  label: string;
  content: ReactNode;
}

export interface CarouselProps {
  /** Accessible name of the region. Required — this is a landmark. */
  label: string;
  items: CarouselItem[];
  /**
   * Singular noun for the controls' labels: "announcement" gives "Next
   * announcement", which is what a screen-reader user hears instead of the
   * useless "Next".
   */
  itemNoun?: string;
  /** Reserved height for the slide area, so paging does not reflow the page. */
  minHeight?: string;
  className?: string;
}

/**
 * One item at a time, advanced only by the reader.
 *
 * **There is no auto-rotation, and that is a product decision rather than an
 * unimplemented feature.** A timer moves content away before a slower reader
 * has finished the sentence they were on, it steals the thing a user was
 * reaching for, and on a tool somebody opens every morning it trains them to
 * wait rather than read. Engagement past the first slide of an auto-rotating
 * carousel is close to nothing anyway, so the timer costs the reader something
 * real and buys the publisher nothing. If this component ever grows an
 * `autoPlay` prop it also has to grow a pause control, a pause-on-hover, a
 * pause-on-focus and a reduced-motion opt-out — which is the clearest possible
 * argument for not growing one.
 *
 * Why it is in the kit at all, given the README's "a second team needs it
 * first" rule: what is hard here is not the paging, it is the accessibility
 * contract around it — the `aria-roledescription` pair, the polite live region
 * that announces a change without interrupting, keeping hidden slides out of
 * the tab order, and the reduced-motion guard. That is a thing to get right
 * once rather than approximately twenty-five times.
 *
 * Only the current slide is rendered. Hidden slides that stay in the DOM are
 * how a keyboard user ends up tabbing into links they cannot see.
 */
export function Carousel({
  label,
  items,
  itemNoun = 'item',
  minHeight,
  className,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const baseId = useId();

  if (items.length === 0) return null;

  // Clamped rather than trusted: the item list can shrink between renders when
  // it arrives from the platform, and an out-of-range index renders nothing at
  // all, which looks exactly like the panel being broken.
  const current = Math.min(index, items.length - 1);
  const item = items[current];
  if (!item) return null;

  const total = items.length;

  /*
   * Wrapping rather than disabling at the ends. A disabled control drops out of
   * the tab order under the user's finger, and the dots already say where in
   * the set they are.
   *
   * Functional update, and that is not a style preference: React batches clicks
   * that land in the same tick, so a handler closing over the rendered `index`
   * makes three fast clicks on Next advance one slide. Anyone paging quickly
   * through four announcements would hit that immediately.
   */
  const step = (delta: number) =>
    setIndex((previous) => (Math.min(previous, total - 1) + delta + total) % total);

  return (
    <section
      className={cx(styles.carousel, className)}
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/*
        Polite, not assertive: a reader who pages forward is already looking at
        the thing that changed, and an assertive region would cut off whatever
        else was being read. `aria-atomic="false"` so only the new slide is
        announced rather than the whole region.
      */}
      <div
        className={styles.viewport}
        style={
          minHeight
            ? { ['--ins-carousel-min-height' as string]: minHeight }
            : undefined
        }
        aria-live="polite"
        aria-atomic="false"
      >
        <div
          key={item.id}
          id={`${baseId}-slide-${current}`}
          className={styles.slide}
          role="group"
          aria-roledescription="slide"
          aria-label={`${current + 1} of ${total}: ${item.label}`}
        >
          {item.content}
        </div>
      </div>

      {total > 1 ? (
        <div className={styles.controls}>
          <div className={styles.dots} role="group" aria-label={`Choose ${itemNoun}`}>
            {items.map((entry, position) => (
              <button
                key={entry.id}
                type="button"
                className={styles.dot}
                aria-current={position === current ? 'true' : undefined}
                aria-label={`${entry.label} (${position + 1} of ${total})`}
                onClick={() => setIndex(position)}
              />
            ))}
          </div>

          <div className={styles.steps}>
            <Text as="span" size="sm" tone="muted">
              {current + 1} / {total}
            </Text>
            <Button size="sm" onClick={() => step(-1)}>
              <span aria-hidden="true">←</span>
              <span className={styles.srOnly}>Previous {itemNoun}</span>
            </Button>
            <Button size="sm" onClick={() => step(1)}>
              <span aria-hidden="true">→</span>
              <span className={styles.srOnly}>Next {itemNoun}</span>
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
