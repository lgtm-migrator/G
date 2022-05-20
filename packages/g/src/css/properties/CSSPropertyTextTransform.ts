import type { CSSProperty } from '../CSSProperty';
import type { DisplayObject } from '../../display-objects';
import type { CSSKeywordValue } from '../cssom';

export const CSSPropertyTextTransform: Partial<CSSProperty<CSSKeywordValue, CSSKeywordValue>> = {
  calculator(
    name: string,
    oldParsed: CSSKeywordValue,
    parsed: CSSKeywordValue,
    object: DisplayObject,
  ) {
    const rawText = object.getAttribute('text');
    if (rawText) {
      let transformedText = rawText;
      if (parsed.value === 'capitalize') {
        transformedText = rawText.charAt(0).toUpperCase() + rawText.slice(1);
      } else if (parsed.value === 'lowercase') {
        transformedText = rawText.toLowerCase();
      } else if (parsed.value === 'uppercase') {
        transformedText = rawText.toUpperCase();
      }

      object.parsedStyle.text = transformedText;
    }

    return parsed;
  },
};
