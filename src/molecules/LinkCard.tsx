import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Text } from '../atoms/Text';
import { cx } from '../utils/cx';
import styles from './LinkCard.module.css';

/**
 * `restricted` draws the ADR-2 tier rule down the left edge. `inert` is the
 * treatment for a card with nothing behind it to open.
 */
export type LinkCardAccent = 'none' | 'restricted' | 'inert';

export interface LinkCardProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title' | 'href'> {
  title: ReactNode;
  /** One line. If it needs two it is not a description, it is documentation. */
  description?: ReactNode;
  /** Top-right of the card, typically Badges. */
  badges?: ReactNode;
  /** The quiet row along the bottom — usually a {@link MetaRow}. */
  meta?: ReactNode;
  /** Heading level for the title, chosen by the caller from the page outline. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  accent?: LinkCardAccent;
  /**
   * When present the whole card is an anchor. Omit it and the card renders as
   * an `article` with no affordance at all — which is the honest rendering of
   * "there is nothing to open here". A disabled-looking control would instead
   * suggest a permission the reader might go and obtain.
   */
  href?: string;
  /**
   * Appended to the link's accessible name — "opens in a new tab", "on its own
   * origin". Visually hidden, because the arrow glyph already says it to
   * everyone who can see it.
   */
  linkHint?: string;
  /** Extra content between the description and the metadata row. */
  children?: ReactNode;
}

/**
 * A card whose whole surface is one link.
 *
 * The card **is** the anchor — not a card with a "View" link in the corner, and
 * not a div with an onClick. That distinction is the entire reason this is a
 * kit component:
 *
 *   - ⌘-click, middle-click, "copy link address" and the browser's status bar
 *     all work, because they are browser behaviour and nothing here intercepts
 *     them. In a tool people keep a dozen tabs of, opening three reports side
 *     by side is the normal way to use it.
 *   - The click target is 280×140px instead of a 40px link, which matters far
 *     more on a touchpad than any amount of hover styling.
 *   - One tab stop per card. A card with a title link *and* an action link is
 *     two stops to say one thing, and twenty-five of those is a keyboard user
 *     pressing Tab fifty times to cross a directory.
 *
 * The constraint that comes with it: no interactive element may be nested
 * inside. Badges and text only. Anything clickable has to live outside the
 * card, because an anchor inside an anchor is invalid and browsers resolve it
 * by dropping one of them.
 */
export function LinkCard({
  title,
  description,
  badges,
  meta,
  headingLevel = 'h3',
  accent = 'none',
  href,
  linkHint,
  className,
  children,
  ...rest
}: LinkCardProps) {
  const classes = cx(
    styles.card,
    accent === 'restricted' && styles.accentRestricted,
    accent === 'inert' && styles.accentInert,
    href && styles.interactive,
    className,
  );

  /*
   * A directional glyph, and the direction is the information: `↗` means the
   * click leaves this page for a new tab, `→` means it stays. Cheap, and it
   * answers "what is about to happen to my current tab" before the click
   * rather than after it. `aria-hidden` — `linkHint` says the same thing to a
   * screen reader in words.
   */
  const arrow = href ? (rest.target === '_blank' ? '↗' : '→') : null;

  const content = (
    <>
      <div className={styles.head}>
        <Text
          as={headingLevel}
          size="lg"
          weight="semibold"
          className={styles.title}
        >
          {title}
          {linkHint ? (
            <span className={styles.visuallyHidden}> — {linkHint}</span>
          ) : null}
        </Text>
        <div className={styles.badges}>
          {badges}
          {arrow ? (
            <span className={styles.arrow} aria-hidden="true">
              {arrow}
            </span>
          ) : null}
        </div>
      </div>

      {description ? (
        <Text size="sm" tone="muted" className={styles.description}>
          {description}
        </Text>
      ) : null}

      {children}

      {meta ? <div className={styles.foot}>{meta}</div> : null}
    </>
  );

  if (!href) {
    // `rest` is anchor-shaped; an inert card takes none of it.
    return <article className={classes}>{content}</article>;
  }

  return (
    <a {...rest} className={classes} href={href}>
      {content}
    </a>
  );
}
