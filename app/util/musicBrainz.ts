/**
 * @file
 * musicbrainz-api is either trying to 1:1 model the results
 * of the restful endpoints or the author made an insane choice
 * to shishkebab all of the key names.
 *
 * I'm tired of working with them and I need to be able to extend
 * the types with additional keys, so this is a helper type file
 * to make sure there isn't a desync with the upstream lib.
 */

import type { IReleaseGroupList, IReleaseGroupMatch } from 'musicbrainz-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MBRecord = Record<string, any>;

type SplitAndCapitalize<S extends string, D extends string>
  = string extends S ? Array<string>
  : S extends '' ? []
  : S extends `${infer T}${D}${infer U}` ? [T, ...SplitAndCapitalize<Capitalize<U>, D>]
  : [S];

type Join<A extends Array<string>, D extends string>
  = A extends [] ? ''
  : A extends [infer T extends string] ? `${T}`
  : A extends [infer T extends string, ...infer U extends Array<string>] ? `${T}${D}${Join<U, D>}`
  : string;

type UnShishkebab<S> = S extends string ? Join<SplitAndCapitalize<S, '-'>, ''> : S;

type Sanitize<O extends MBRecord> = { [K in keyof O as UnShishkebab<K>]: O[K] };

function unSpear<S extends string>(propertyName: S): UnShishkebab<S> {
  return propertyName
    .split('-')
    .map((word, index) => index === 0
      ? word
      : `${word.charAt(0).toUpperCase()}${word.substring(1)}`)
    .join('') as UnShishkebab<S>;
}

export type MBResultList<T extends MBRecord> = {
  created: Intl.DateTimeFormat;
  count: number;
  offset: number;
  results: Sanitize<T>[];
};

export type MBReleaseGroup = Sanitize<IReleaseGroupMatch>;

export function sanitize<T extends MBRecord, S extends Sanitize<T>>(group: T): S {
  const entries = Object.entries(group);
  const sanitized = Object.create(null);

  for (const [key, value] of entries) {
    sanitized[unSpear(key)] = value;
  }

  return sanitized as S;
}

export function sanitizeReleaseGroupList(results: IReleaseGroupList): MBResultList<IReleaseGroupMatch> {
  const { created, count, offset, 'release-groups': releaseGroups } = results;

  return {
    created,
    count,
    offset,
    results: releaseGroups.map(sanitize),
  };
}
