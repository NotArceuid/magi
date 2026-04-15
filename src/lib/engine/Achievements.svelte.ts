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
      Object.values(this.AchievementData).forEach((e) => {
        arr.push(e.unlocked ?? false);
      })
      return arr;
    })

    save.LoadCallback<boolean[]>(this.SAVEKEY, (data) => {
      let arr = Object.values(this.AchievementData);
      for (let i = 0; i < arr.length; i++) {
        arr[i].unlocked = data[i];
      }
    })
  }

  UnlockAchievement(key: AchievementKey) {
    if (this.AchievementData[key].unlocked)
      return;

    this.AchievementData[key].unlocked = true;
    NotificationPopUp.invoke(this.AchievementData[key]);
  }

  UnlockedAchievementCount(): number {
    return Object.values(this.AchievementData)
      .filter(data => data.unlocked)
      .length;
  }

  public AchievementData: Record<AchievementKey, IAchievement> = $state({

  });
}

enum AchievementKey {

}

