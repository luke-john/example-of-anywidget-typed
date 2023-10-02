/// <reference lib="dom" />
import { widget } from "https://raw.githubusercontent.com/manzt/anywidget/main/packages/anywidget/mod.ts";

export async function anywidgetTyped<
  State,
  ImportPaths extends Record<string, Record<string, any>>,
>(
  /**
   * test
   */
  transfer: {
    // Unfortunately `typeof import` doesn't work with generics
    // if it did, we could do `imports: { [key in keyof ImportPaths]: typeof import(ImportPaths[key]) };`
    // in the transferComponent function types
    /**
     * This requires a bit of work to get right.
     *
     * To import d3, the key value would look like
     * ```ts
     *   "d3": `import * as d3 from "https://esm.sh/d3@7"` as typeof import("npm:d3")
     */
    imports: ImportPaths;
    state: State;
  },
  createSetup: (imports: { [key in keyof ImportPaths]: ImportPaths[key] }) => {
    render: (_: {
      model: FrontEndModel<State>;
      el: HTMLElement;
    }) => any;
  },
) {
  const setup = createSetup(transfer.imports);

  const importsString = Object.entries(transfer.imports).map((
    [importKey, importValue],
  ) => `import * as ${importKey} from "${importValue}"`).join("\n");

  return await widget({
    state: transfer.state,
    imports: `${importsString}`,
    render: setup.render,
  });
}

// vendored from  https://github.com/manzt/anywidget/commit/3b295de8b492f6a12b31a3c7403b0dd9d877a772
// for the types

type ChangeEvents<State> = {
  [K in (string & keyof State) as `change:${K}`]: State[K];
};
class Model<State> {
  _state: State;

  constructor(state: State) {
    this._state = state;
  }
  get<K extends keyof State>(key: K): State[K] {
    return this._state[key];
  }
  set<K extends keyof State>(key: K, value: State[K]): void {
    this._state[key] = value;
  }
  on<Event extends keyof ChangeEvents<State>>(
    _name: Event,
    _callback: (data: ChangeEvents<State>[Event]) => void,
  ): void {
  }
}

type FrontEndModel<State> = Model<State> & {
  save_changes(): void;
};
