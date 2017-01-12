import { expect } from 'chai';
import * as babel from 'babel-core';
import polyglotPlugin from 'src/plugin';
import { rmDirSync } from 'src/utils';

const pofile = 'tests/fixtures/resolve_simple_gettext.po';

const options = {
    presets: ['es2015'],
    plugins: [[polyglotPlugin, {
        resolve: { locale: 'en-us' },
        locales: {
            'en-us': pofile,
        },
        discover: ['gettext'],
    }]],
};

describe('Resolve gettext', () => {
    before(() => {
        rmDirSync('debug');
    });

    it('should resolve simple gettext literal (without formatting)', () => {
        const input = 'console.log(gettext("simple string literal"));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal translated");');
    });

    it('should resolve original string if no translation is found', () => {
        const input = 'console.log(gettext("simple string literal without translation"));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("simple string literal without translation");');
    });

    it('should resolve original string if no translator notes', () => {
        const input = 'console.log(gettext("no translator notes"));';
        const result = babel.transform(input, options).code;
        expect(result).to.contain('console.log("no translator notes");');
    });

    it('should throw if has invalid expressions', () => {
        const input = 'console.log(gettext(fn()));';
        const func = () => babel.transform(input, options).code;
        expect(func).to.throw('You can not use CallExpression \'fn()\' as an argument to gettext');
    });
});
