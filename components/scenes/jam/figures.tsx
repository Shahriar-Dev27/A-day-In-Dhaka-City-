import { STROKE, blob, curve, ribbon, type V2 } from "../tong/geometry";

/*
  The two storytelling figures of Scene 3, in the cast's language (ink silhouette, one costume cue, no
  faces). Both are drawn in the local coordinates of the vehicle they belong to (rickshaw / bus origin =
  ground contact), so a scene places them with the same `at` as the vehicle.
*/

const place = (at: V2) => `translate(${at[0]} ${at[1]})`;

/**
 * The commuter on the phone, seated in a rickshaw: cream half-sleeve shirt (the cue), backpack on his
 * lap, ID card on a lanyard, the phone at his ear. Same figure as Scene 4's commuter.
 */
export function Commuter({ at }: { at: V2 }) {
  return (
    <g transform={place(at)} data-commuter>
      <g className="fill-ink">
        <path d={ribbon([[156, -192, 26], [212, -194, 22], [216, -132, 14]])} />
        <path d={ribbon([[154, -192, 36], [148, -232, 34], [150, -262, 28]])} />
        <ellipse cx="156" cy="-286" rx="15" ry="17" />
      </g>
      <path className="cue-cap" d={ribbon([[154, -196, 30], [148, -232, 28], [150, -260, 22]])} />
      <rect x="184" y="-236" width="32" height="46" rx="9" className="fill-wall-dark" />
      <path d="M190 -232V-196" strokeWidth="2.2" className="stroke-ink" opacity="0.6" />
      <path d={curve([[142, -256], [146, -238], [148, -224]])} fill="none" strokeWidth="2.4" className="cue-lanyard-s" />
      <rect x="141" y="-226" width="14" height="19" rx="1.5" className="cue-lanyard" />
      {/* the phone arm: elbow out, hand at the ear */}
      <path className="fill-ink" d={ribbon([[152, -258, 12], [186, -264, 11], [172, -298, 9]])} />
      <rect x="166" y="-308" width="9" height="20" rx="2" transform="rotate(14 170 -298)" className="j-cream" />
    </g>
  );
}

/**
 * The bus helper hanging off the door, banging the side and shouting the route. The banging arm is its
 * own group (data-bang) and so are the three impact ticks (data-impact): the scene scrubs them.
 */
export function Helper({ at }: { at: V2 }) {
  return (
    <g transform={place(at)} data-helper>
      <g className="fill-ink">
        <path d={ribbon([[548, -152, 22], [534, -118, 18], [532, -92, 10], [546, -88, 8]])} />
        <path d={ribbon([[548, -152, 32], [556, -190, 30], [566, -226, 24]])} />
        <path d={ribbon([[550, -150, 24], [564, -120, 20], [554, -92, 12], [570, -86, 8]])} />
        <ellipse cx="576" cy="-250" rx="14" ry="16" />
        <path d={ribbon([[566, -224, 12], [584, -240, 10], [590, -250, 8]])} />
      </g>
      <path className="cue-khaki" d={ribbon([[548, -156, 27], [556, -190, 27], [565, -222, 21]])} />
      <path d={blob([[562, -254], [566, -272], [584, -274], [592, -260], [582, -260], [568, -256]])} fill="url(#gamchha-check)" />
      <g data-bang>
        <path className="fill-ink" d={ribbon([[562, -218, 12], [530, -198, 10], [498, -170, 9]])} />
        <ellipse cx="494" cy="-166" rx="9" ry="7" className="fill-ink" />
      </g>
      <path data-impact d="M482 -180l-12 -8M478 -166h-16M482 -152l-12 8" fill="none" strokeLinecap="round" strokeWidth={STROKE.line} className="s-cream" opacity="0" />
    </g>
  );
}

/** Tassels on the hero rickshaw's panel: the one place tinsel moves on its own (CSS loop, paused off-screen). */
export function Tassels({ at }: { at: V2 }) {
  return (
    <g transform={place(at)} data-tassels>
      {[44, 92, 140, 188].map((x, i) => (
        <path key={x} className="jam-tassel loop j-rk-trim-s" style={{ animationDelay: `${-i * 0.22}s` }} d={`M${x} -90V-60`} fill="none" strokeWidth="3.4" strokeLinecap="round" />
      ))}
    </g>
  );
}

/** Exhaust: three soft puffs at a tailpipe (CSS loop). */
export function Exhaust({ at }: { at: V2 }) {
  return (
    <g transform={place(at)}>
      {[0, 1, 2].map((i) => (
        <circle key={i} className="jam-puff loop fill-ink" cx="0" cy="0" r="13" />
      ))}
    </g>
  );
}
