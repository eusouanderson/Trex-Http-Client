import type { Extension } from '@codemirror/state';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { json } from '@codemirror/lang-json';
import {
  search,
  searchKeymap,
  highlightSelectionMatches,
  openSearchPanel,
} from '@codemirror/search';
import { tags } from '@lezer/highlight';
import type { JsonThemeSettings } from '../../../features/settings/interfaces';
import type { ICodeMirrorThemeService } from './interfaces';

class CodeMirrorThemeService implements ICodeMirrorThemeService {
  public triggerSearch(view: EditorView | null): void {
    if (view) {
      openSearchPanel(view);
    }
  }

  private createTheme(theme: JsonThemeSettings): Extension {
    return EditorView.theme(
      {
        '&': {
          backgroundColor: theme.backgroundColor,
          color: '#f5f1eb',
          fontSize: '12px',
          fontFamily: 'monospace',
          height: '100%',
        },
        '.cm-content': {
          caretColor: theme.keyColor,
          padding: '8px 0',
        },
        '.cm-cursor, .cm-dropCursor': {
          borderLeftColor: theme.keyColor,
        },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '.cm-gutters': {
          backgroundColor: theme.backgroundColor,
          color: '#777166',
          borderRight: '1px solid #3f3b35',
        },
        '.cm-foldGutter': {
          display: 'none !important',
        },
        '.cm-panels': {
          backgroundColor: theme.backgroundColor,
          color: '#f5f1eb',
        },
        '.cm-panels.cm-panels-top': {
          borderBottom: '1px solid #3f3b35',
        },
        '.cm-search': {
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '6px 12px',
          fontSize: '11px',
        },
        '.cm-search input.cm-textfield': {
          backgroundColor: '#1b1917',
          color: '#f5f1eb',
          border: '1px solid #3f3b35',
          borderRadius: '4px',
          padding: '3px 8px',
          outline: 'none',
          fontSize: '11px',
        },
        '.cm-search input.cm-textfield:focus': {
          borderColor: theme.keyColor,
        },
        '.cm-search button.cm-button': {
          backgroundColor: '#292524',
          color: '#f5f1eb',
          border: '1px solid #3f3b35',
          borderRadius: '4px',
          padding: '3px 8px',
          cursor: 'pointer',
          fontSize: '11px',
        },
        '.cm-search button.cm-button:hover': {
          backgroundColor: '#3f3b35',
        },
        '.cm-search label': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: '#a8a29e',
        },
        '.cm-searchMatch': {
          backgroundColor: 'rgba(234, 179, 8, 0.35)',
          outline: '1px solid rgba(234, 179, 8, 0.7)',
          borderRadius: '2px',
        },
        '.cm-searchMatch-selected': {
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
          outline: '1px solid rgba(34, 197, 94, 0.9)',
          borderRadius: '2px',
        },
        '.cm-selectionMatch': {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
      },
      { dark: true },
    );
  }

  private createSyntaxHighlighting(theme: JsonThemeSettings): Extension {
    const highlight = HighlightStyle.define([
      { tag: tags.propertyName, color: theme.keyColor },
      { tag: tags.string, color: theme.stringColor },
      { tag: tags.number, color: theme.numberColor },
      { tag: tags.bool, color: theme.booleanColor },
      { tag: tags.null, color: theme.nullColor },
      { tag: tags.bracket, color: theme.bracketColor },
      { tag: tags.punctuation, color: '#b3afa6' },
    ]);
    return syntaxHighlighting(highlight);
  }

  public buildExtensions(
    theme: JsonThemeSettings,
    readOnly = false,
  ): Extension[] {
    const extensions: Extension[] = [
      lineNumbers(),
      history(),
      bracketMatching(),
      closeBrackets(),
      json(),
      search({ top: true }),
      highlightSelectionMatches(),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      this.createTheme(theme),
      this.createSyntaxHighlighting(theme),
    ];

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    return extensions;
  }
}

export { CodeMirrorThemeService };
