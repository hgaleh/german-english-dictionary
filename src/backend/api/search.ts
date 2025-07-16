import axios from 'axios';
import * as cheerio from 'cheerio';

const uri = 'http://dict.leo.org/%s%s/';

class LeoResult {
  subst?: Pair[] | null;
  verb?: Pair[] | null;
  adjadv?: Pair[] | null;
  praep?: Pair[] | null;
  definition?: Pair[] | null;
  phrase?: Pair[] | null;
  example?: Pair[] | null;
  base?: string[] | null;
  sim?: string[] | null;
}

function getSimilarWords($: cheerio.CheerioAPI) {
  const section = $(`#sim table tbody tr td:nth-child(2)`);
    if (!section.length) return null;

  const result: string[] = [];

    section.find('a').each((_, el) => {
      const sourceText = getText($, el);
      result.push(sourceText);
    });
    return result;
}

function getDefinitions($: cheerio.CheerioAPI) {
  return function (sectionName: keyof LeoResult): Pair[] | null {
    const section = $(`div#section-${sectionName}`);
    if (!section.length) return null;
    const result: Pair[] = [];

    section.find(`td[lang="en"]`).each((_, el) => {
      const $el = $(el);
      const sourceText = getText($, el);
      // Find the corresponding td for the target language in the same row
      const row = $el.closest('tr');
      const targetTd = row.find(`td[lang="de"]`);
      const targetText = getText($, targetTd[0]);
      result.push({
        'en': sourceText.split('|').filter(val => val),
        'de': targetText.split('|').filter(val => val),
      });
    });
    return result;
  }
}

function getBaseForms($: cheerio.CheerioAPI): string[] | null {

  const section = $('#base');
  if (!section.length) return null;
  const result: string[] = [];

  section.find(`a.c-link`).each((_, el) => {
    const sourceText = getText($, el);
    result.push(sourceText);
  });

  return result;
}

type Lang = 'en' | 'de';

export type Pair = Record<Lang, string[]>;

function getText($: cheerio.CheerioAPI, elt: any): string {
  return $(elt).text().trim();
}

export async function search(term: string, timeoutMs: number = 5000): Promise<LeoResult> {
  const url = uri.replace('%s', 'en').replace('%s', 'de');
  const result: LeoResult = new LeoResult();

  try {
    const resp = await axios.get(url, {
      params: { search: term },
      timeout: timeoutMs,
    });

    const $ = cheerio.load(resp.data);
    const definitionGetter = getDefinitions($);
    result.subst = definitionGetter('subst');
    result.verb = definitionGetter('verb');
    result.adjadv = definitionGetter('adjadv');
    result.praep = definitionGetter('praep');
    result.definition = definitionGetter('definition');
    result.phrase = definitionGetter('phrase');
    result.example = definitionGetter('example');
    result.base = getBaseForms($);
    result.sim = getSimilarWords($);
  } catch (e) {
    // Any error (request or parse) just returns an empty result
  }
  return result;
}
