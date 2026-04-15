import type { Saves } from "$lib/engine/Saves";
import { Notation } from "$lib/engine/utils/BreakInfinity/Formatter.svelte";

export class Settings {
  constructor(saves: Saves) {
    saves.SaveCallback<ISettings>(this.SAVEKEY, () => {
      return {
        Theme: this.Theme,
        Format: this.Format,
        Sounds: this.Sounds
      };
    })

    saves.LoadCallback<ISettings>(this.SAVEKEY, (data) => {
      let oldTheme = this.Theme;
      this.Theme = data.Theme;
      this.SetTheme(oldTheme);
      this.Format = data.Format;
      this.Sounds = data.Sounds;
    })

  }

  public Theme = $state(ColorTheme.Light);
  public Format = $state(Notation.Standard);
  public Sounds = $state(false);

  public classList: Record<ColorTheme, string> = {
    [ColorTheme.Light]: "light",
    [ColorTheme.Dark]: "dark",
  };

  SetTheme(oldTheme: ColorTheme) {
    document.documentElement.classList.remove(this.classList[oldTheme]);
    switch (this.Theme) {
      case ColorTheme.Dark:
        document.documentElement.classList.toggle(this.classList[ColorTheme.Dark]);
        break;
      case ColorTheme.Light:
        document.documentElement.classList.toggle(this.classList[ColorTheme.Light]);
    }
  }

  private get SAVEKEY() { return "settings"; }
}

interface ISettings {
  Theme: ColorTheme,
  Format: Notation,
  Sounds: boolean
}


export enum ColorTheme {
  Light, Dark
}
