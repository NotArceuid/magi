import { NotificationPopUp, type INotification } from "$lib/components/Notification.svelte";
import type { Saves } from "./Saves";
import type { Decimal } from "./utils/BreakInfinity/Decimal.svelte";

export interface IAchievement extends INotification {
  name: string,
  description: string,
  check: (...props: Decimal[]) => boolean;
  unlocked?: boolean
}

export class Achievement {
  private get SAVEKEY() { return "achievement" };
  constructor(save: Saves) {
    save.SaveCallback<boolean[]>(this.SAVEKEY, () => {
      let arr: boolean[] = []
      Object.values(this.Data).forEach((e) => {
        arr.push(e.unlocked ?? false);
      })
      return arr;
    })

    save.LoadCallback<boolean[]>(this.SAVEKEY, (data) => {
      let arr = Object.values(this.Data);
      for (let i = 0; i < arr.length; i++) {
        arr[i].unlocked = data[i];
      }
    })
  }

  UnlockAchievement(key: AchievementKey) {
    if (this.Data[key].unlocked)
      return;

    this.Data[key].unlocked = true;
    NotificationPopUp.invoke(this.Data[key]);
  }

  UnlockedAchievementCount(): number {
    return Object.values(this.Data)
      .filter(data => data.unlocked)
      .length;
  }

  public Data: Record<AchievementKey, IAchievement> = $state({

  });
}

export enum AchievementKey {

}

