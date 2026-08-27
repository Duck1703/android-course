// Task 10 — registry lesson
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

import Ch01WelcomeToAndroidKotlin from "../components/lessons/Ch01WelcomeToAndroidKotlin.astro";
import Ch01Quiz from "../components/lessons/Ch01Quiz.astro";
import Ch02GettingStartedAndroidStudio from "../components/lessons/Ch02GettingStartedAndroidStudio.astro";
import Ch02Quiz from "../components/lessons/Ch02Quiz.astro";
import Ch03AndroidFundamentals from "../components/lessons/Ch03AndroidFundamentals.astro";
import Ch03Quiz from "../components/lessons/Ch03Quiz.astro";
import Ch04GradleBasics from "../components/lessons/Ch04GradleBasics.astro";
import Ch04Quiz from "../components/lessons/Ch04Quiz.astro";
import Ch05JetpackCompose from "../components/lessons/Ch05JetpackCompose.astro";
import Ch05Quiz from "../components/lessons/Ch05Quiz.astro";
import Ch06AdvancedJetpackCompose from "../components/lessons/Ch06AdvancedJetpackCompose.astro";
import Ch06Quiz from "../components/lessons/Ch06Quiz.astro";
import Ch07AdvancedArchitecture from "../components/lessons/Ch07AdvancedArchitecture.astro";
import Ch07Quiz from "../components/lessons/Ch07Quiz.astro";
import Ch08Networking from "../components/lessons/Ch08Networking.astro";
import Ch08Quiz from "../components/lessons/Ch08Quiz.astro";
import Ch09DataStore from "../components/lessons/Ch09DataStore.astro";
import Ch09Quiz from "../components/lessons/Ch09Quiz.astro";
import Ch10RoomDatabase from "../components/lessons/Ch10RoomDatabase.astro";
import Ch10Quiz from "../components/lessons/Ch10Quiz.astro";
import Ch11AdvancedStorage from "../components/lessons/Ch11AdvancedStorage.astro";
import Ch11Quiz from "../components/lessons/Ch11Quiz.astro";

interface LessonEntry {
  Lesson: AstroComponentFactory;
  Quiz: AstroComponentFactory;
}

export const LESSONS: Partial<Record<string, LessonEntry>> = {
  "ch01-welcome-to-android-kotlin": {
    Lesson: Ch01WelcomeToAndroidKotlin,
    Quiz: Ch01Quiz,
  },
  "ch02-getting-started-with-android-studio": {
    Lesson: Ch02GettingStartedAndroidStudio,
    Quiz: Ch02Quiz,
  },
  "ch03-android-fundamentals": { Lesson: Ch03AndroidFundamentals, Quiz: Ch03Quiz },
  "ch04-gradle-basics-a-look-behind-the-curtain": { Lesson: Ch04GradleBasics, Quiz: Ch04Quiz },
  "ch05-jetpack-compose": { Lesson: Ch05JetpackCompose, Quiz: Ch05Quiz },
  "ch06-advanced-jetpack-compose": { Lesson: Ch06AdvancedJetpackCompose, Quiz: Ch06Quiz },
  "ch07-advanced-architecture": { Lesson: Ch07AdvancedArchitecture, Quiz: Ch07Quiz },
  "ch08-networking": { Lesson: Ch08Networking, Quiz: Ch08Quiz },
  "ch09-data-store": { Lesson: Ch09DataStore, Quiz: Ch09Quiz },
  "ch10-room-database": { Lesson: Ch10RoomDatabase, Quiz: Ch10Quiz },
  "ch11-advanced-storage": { Lesson: Ch11AdvancedStorage, Quiz: Ch11Quiz },
};
