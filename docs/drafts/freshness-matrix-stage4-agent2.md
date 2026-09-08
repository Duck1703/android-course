# Stage 4 Freshness Matrix — AGENT 2 (Official Docs / Freshness Researcher)

- Checked-at date: **2026-09-08** (all fetches with `?hl=en`)
- Authority: developer.android.com (primary), kotlinlang.org (Kotlin serialization only)
- Scope: Navigation (Nav 2.x), Navigation 3, Compose navigation, type-safe routes, Kotlin serialization, Material deprecations relevant to Stage 4 (Navigation)

Legend: PASS = claim still current as taught; UPDATE_REQUIRED = stale, must fix; AMBIGUOUS = partially true / needs careful wording.

---

## 1. Navigation Compose current status

- Source: "Navigation | App architecture | Android Developers" — https://developer.android.com/develop/ui/compose/navigation?hl=en (page: "Last updated 2026-08-26 UTC"), checked 2026-09-08
- Current status: Still the official recommendation for Compose apps.
- Key quote (Framework options):
  > "Compose: If your app is built entirely with Jetpack Compose, use Navigation Compose. Destinations in your graph are composables."
  > "For applications migrating from Views to Compose, the recommended strategy is to continue using the Fragment-based Navigation component while converting individual screens to Compose. Once all fragments have been replaced with composables, you can migrate the navigation graph to Navigation Compose."
- Dependency snippet on the same page uses `val nav_version = "2.10.0"`.
- Verdict: **PASS** (Navigation Compose remains the recommended approach for all-Compose apps; note in course docs that the Nav2 library overall is now in maintenance mode — see topic 13.)

## 2. Current official type-safe navigation guidance

- Source: "Type safety" design guide — https://developer.android.com/guide/navigation/design/type-safety?hl=en, checked 2026-09-08 (plus setup snippets from /develop/ui/compose/navigation)
- Current status: Type-safe routes with `@Serializable` Kotlin objects/data classes are the documented, stable, recommended way (Navigation Compose / Kotlin DSL). Official wording: "Defining the destination type is a more robust approach than passing a route string as in `composable(\"profile\")`."
- Key quotes:
  > "You can use built-in type safe APIs to provide compile-time type safety for your navigation graph. These APIs are available when your app uses the Navigation Compose or Navigation Kotlin DSL. They are available as of Navigation 2.8.0."
  > "These APIs are equivalent to what Safe Args provides to navigation graphs built using XML."
  > "composable() takes a type parameter. That is, composable\<Profile\>."
- Route rules: "Object: Use an object for routes without arguments." / "Class: Use a class or data class for routes with arguments." / "In all cases the object or class must be serializable."
- Verdict: **PASS** for type-safe routes as the recommended approach. Note: string routes are NOT deprecated (see topic 15) but type-safe is presented as "more robust".

## 3. Type-safe route prerequisites

- Sources: /guide/navigation/design/type-safety?hl=en; /develop/ui/compose/navigation?hl=en (setup); androidx.navigation releases page; kotlinlang.org; checked 2026-09-08
- Current status: Confirmed — type-safe APIs shipped in **Navigation 2.8.0 (stable, September 4, 2024)**. Release note quote:
  > "Navigation now provides type-safety for the Kotlin DSL (used by Navigation Compose) using Kotlin Serialization to allow you to define destinations in your navigation graph via type safe objects and data classes"
  - (Stabilization of previously-experimental APIs: 2.8.0-alpha08, May 1, 2024.)
- Required dependencies (exact, from official setup snippets, current as of 2026-09-08):
  - Plugin (Kotlin DSL): `kotlin("plugin.serialization") version "2.0.21"` with comment `// Kotlin serialization plugin for type safe routes and navigation arguments`
  - Plugin (Groovy): `id 'org.jetbrains.kotlin.plugin.serialization' version '2.0.21'`
  - Runtime: `implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")` — official comment: "JSON serialization library, works with the Kotlin serialization plugin"
- Imports: The Android docs' code samples do NOT show import statements. Kotlinlang's serialization page shows only wildcard imports (`import kotlinx.serialization.*`, `import kotlinx.serialization.json.*`). The fully-qualified import `import kotlinx.serialization.Serializable` is standard/correct but is not literally printed in current official pages — course should keep it but can't cite a page that prints it.
- Verdict: **PASS** for 2.8.0 threshold + plugin/dependency requirements. **UPDATE_REQUIRED** if course pins older plugin/serialization versions; note official snippets currently show serialization plugin `2.0.21` and `kotlinx-serialization-json:1.7.3` (kotlinlang's own latest-example versions are higher: plugin 2.4.20 / json 1.11.0 — versions on the Android page track the Android docs' chosen Kotlin version, so don't treat 2.0.21 as a hard minimum beyond 2.8.0-era Kotlin).

## 4. NavHost role (official definition)

- Source: https://developer.android.com/develop/ui/compose/navigation?hl=en (key concepts table), checked 2026-09-08
- Exact quote (Host):
  > "A UI element that contains the current navigation destination. That is, when a user navigates through an app, the app essentially swaps destinations in and out of the navigation host."
  - Compose type: `NavHost`
- Verdict: **PASS** (definition unchanged in current docs).

## 5. NavController role (official definition)

- Source: https://developer.android.com/develop/ui/compose/navigation?hl=en (key concepts table) and https://developer.android.com/guide/navigation/navcontroller?hl=en, checked 2026-09-08
- Exact quotes:
  > "The central coordinator for managing navigation between destinations. The controller offers methods for navigating between destinations, handling deep links, managing the back stack, and more."
  > "NavController is the central navigation API. It tracks which destinations the user has visited, and allows the user to move between destinations."
  > "Note: Each NavHost you create has its own corresponding NavController. The NavController provides access to the NavHost's graph."
- Verdict: **PASS**.

## 6. navigate() behavior

- Source: "Navigation and the back stack" — https://developer.android.com/guide/navigation/backstack?hl=en, checked 2026-09-08
- Exact quote:
  > "Pushing to the stack: Each call NavController.navigate() pushes the given destination to the top of the stack."
- Default behavior: plain `navigate()` pushes onto the back stack (no popping); `popUpTo`, `launchSingleTop`, `saveState/restoreState` are opt-in NavOptions.
- Verdict: **PASS**.

## 7. Back stack conceptual behavior (LIFO)

- Source: https://developer.android.com/guide/navigation/backstack?hl=en, checked 2026-09-08
- Exact quotes:
  > "The NavController holds a \"back stack\" that contains the destinations the user has visited."
  > "In being a stack, the back stack is a \"last in, first out\" data structure. The NavController therefore pushes items to and pops items from the top of the stack."
  > "Important: As the back stack is fundamentally a part of the NavController class, its behavior is consistent regardless of which UI framework you use."
- Verdict: **PASS**.

## 8. popBackStack() semantics

- Source: https://developer.android.com/guide/navigation/backstack?hl=en, checked 2026-09-08
- Exact quotes:
  > "The NavController.popBackStack() method attempts to pop the current destination off the back stack and navigate to the previous destination. This effectively moves the user back one step in their navigation history. It returns a boolean indicating whether it successfully popped back to the destination."
  > "When the popBackStack() returns false, a subsequent call to NavController.getCurrentDestination() returns null. This means the app has popped the last destination off the back stack. In this case, the user sees only a blank screen."
  - Returns false cases: "popBackStack() did not pop anything from the stack." / "popBackStack() did pop a destination off the back stack and the stack is now empty."
  > "The most common case when popBackStack() returns false is when you have manually popped the start destination off the back stack as that should be the last destination left on the back stack."
  - Overloads: "Critically, they pop everything on the stack above that destination." + `inclusive` boolean semantics.
- Verdict: **PASS** (semantics identical to 2.7-era docs; no change).

## 9. Route argument retrieval (current recommended APIs)

- Source: https://developer.android.com/guide/navigation/design/type-safety?hl=en, checked 2026-09-08
- Current status: `NavBackStackEntry.toRoute<T>()` and `SavedStateHandle.toRoute<T>()` are the documented current APIs for type-safe routes.
- Exact quotes/code:
  > "For the profile route, the toRoute() extension method recreates the Profile object from the NavBackStackEntry and its arguments."
  ```kotlin
  composable<Profile> { backStackEntry ->
      val profile: Profile = backStackEntry.toRoute()
      ProfileScreen(profile.id)
  }
  ```
  > "To access arguments from a type-safe route in a ViewModel, you can retrieve the route from the SavedStateHandle by calling SavedStateHandle.toRoute\<T\>(), where T is your route class"
  ```kotlin
  private val profile = savedStateHandle.toRoute<Profile>()
  ```
- Also: "The route class defines the type of each navigation argument, as in `val id: String`, so there's no need for `NavArgument`."
- Verdict: **PASS** for toRoute-based retrieval. **UPDATE_REQUIRED** if the course still teaches `backStackEntry.arguments?.getString(...)` + `navArgument()` as the primary pattern (that now reads as the legacy pattern; not deprecated, but docs steer to toRoute).

## 10. Pass IDs / minimal data (not whole objects)

- Source: "Pass data between destinations" — https://developer.android.com/guide/navigation/use-graph/pass-data?hl=en, checked 2026-09-08
- Exact quotes:
  > "In general, you should strongly prefer passing only the minimal amount of data between destinations. For example, you should pass a key to retrieve an object rather than passing the object itself, as the total space for all saved states is limited on Android. If you need to pass large amounts of data, use a ViewModel as described in ViewModel overview."
  > "To pass around custom complex data, store the data elsewhere such as a ViewModel or database and only pass an identifier while navigating; then retrieve the data in the new location after navigation has concluded."
  > "Caution: Passing complex data structures over arguments is considered an poor practice. Each destination should be responsible for loading UI data based on the minimum necessary information, such as item IDs. This simplifies process recreation and avoids potential data inconsistencies." (typo "an poor" is in the original)
- Verdict: **PASS** (pass-the-ID guidance is current and verbatim in today's docs). Note the docs give no "10KB" figure — only "limited on Android".

## 11. Navigation 2 latest stable version

- Source: https://developer.android.com/jetpack/androidx/releases/navigation?hl=en, checked 2026-09-08
- Exact status: summary table row — Latest Update "August 26, 2026", Stable Release **2.10.0**, RC/Beta/Alpha all "–".
- Entry: "Version 2.10.0 — August 26, 2026 — androidx.navigation:navigation-*:2.10.0 is released."
- Recent pre-releases (superseded): 2.10.0-rc01 (2026-08-12, minSdk moved to API 24), 2.10.0-beta01 (2026-07-29), 2.10.0-alpha06 (2026-07-01).
- Verdict: **UPDATE_REQUIRED** for any course pinning 2.7.2/2.8.x as "latest" — latest stable is **2.10.0 (2026-08-26)**.

## 12. Navigation 3 stable/current status

- Source: https://developer.android.com/jetpack/androidx/releases/navigation3?hl=en, checked 2026-09-08
- Exact status: Stable Release **1.1.7** (released **August 26, 2026**); Beta **1.2.0-beta01** (2026-08-26); 1.2.0-alpha07 (2026-07-29).
- Stability history quotes:
  > "The Navigation3 library is now stable! Navigation3 is the AndroidX Compose first approach to navigation." — Version 1.0.0 (November 19, 2025)
  > "1.1.0 is now stable!" — Version 1.1.0 (April 08, 2026)
- Current dependency snippet on the page: `androidx.navigation3:navigation3-runtime:1.2.0-beta01` / `navigation3-ui:1.2.0-beta01` (beta track).
- Artifacts: `androidx.navigation3.runtime` (KMP-enabled building blocks), `androidx.navigation3.ui` (NavDisplay).
- Verdict: **UPDATE_REQUIRED** vs the expectation "expect 1.0.0 stable 19/11/2025" — that was true, but latest stable is now **1.1.7 (2026-08-26)** with 1.2.0 in beta.

## 13. Nav3 relationship to Nav2 (current official wording)

- Sources: https://developer.android.com/jetpack/androidx/releases/navigation?hl=en; https://developer.android.com/guide/navigation/navigation-3?hl=en; https://developer.android.com/guide/navigation/navigation-3/migration-guide?hl=en; all checked 2026-09-08
- The Nav2 releases page now carries this callout verbatim:
  > "Caution: This library is in maintenance mode and will only receive critical fixes; new features are not planned. We recommend using Jetpack Compose for building Android UIs. See Compose-first (/develop/ui/compose/first) for more information."
- Nav3 overview wording (no "replacement"/"next generation" literal):
  > "Navigation 3 is a new navigation library designed to work with Compose."
  > "With Navigation 3, you have full control over your back stack, and navigating to and from destinations is as simple as adding and removing items from a list."
  > "Navigation 3 improves upon the original Jetpack Navigation API in the following ways: Provides a simpler integration with Compose; Offers you full control of the back stack; Makes it possible to create layouts that can read more than one destination from the back stack at the same time, allowing them to adapt to changes in window size and other inputs." (heading is "Improvements upon Jetpack Navigation")
- Migration: dedicated guide exists — https://developer.android.com/guide/navigation/navigation-3/migration-guide ("To migrate your app from Navigation 2 to Navigation 3, follow these steps:"; mappings: route → `NavKey`, `NavController.navigate()` → Navigator `navigate()`, `popBackStack()` → `goBack()`, `NavHost` → `NavDisplay`, `composable<T>` → `entry<T>`, `dialog<T>` → `entry<T>(metadata = DialogSceneStrategy.dialog())`, nested `navigation` → deleted).
- Compose-only: Nav3 is Compose-first; "navigation3-ui" has no non-Android KMP targets ("On other platforms, you will need to implement your own custom NavDisplay.").
- Verdict: **AMBIGUOUS / careful wording needed** — official current position: Nav2 is in maintenance mode (release-page caution) while the Compose Navigation docs still recommend Navigation Compose for all-Compose apps (topic 1). Neither page literally says "Nav3 replaces Nav2" or "use Nav3 for new apps". Safest course phrasing: "Navigation 2 is in maintenance mode (critical fixes only); Navigation 3 is the new Compose-first navigation library; current stable guidance for Compose apps remains Navigation Compose."

## 14. How docs characterize Nav3 vs Nav2 (exact wording found)

- See topic 13 quotes. Characterizations found (verbatim): "a new navigation library designed to work with Compose"; "the AndroidX Compose first approach to navigation" (1.0.0 note); "a new navigation library built specifically to handle Jetpack Compose in-app navigation" (1.0.0-alpha01 note); "improves upon the original Jetpack Navigation API". No occurrence of "next generation" or "replacement" on any fetched official page.
- Verdict: **AMBIGUOUS** (course should quote the "maintenance mode" caution + "designed to work with Compose", not invented "replacement" claims).

## 15. Deprecated navigation APIs relevant to Stage 4

- String routes / `navigate(String)` / `navArgument` / `NavType`:
  - Source: https://developer.android.com/jetpack/androidx/releases/navigation?hl=en scanned 2.8.x–2.10.x for "deprecat*" — zero matches. String routes and navArgument are NOT deprecated (2.8.1 note even relies on the string-route overload for a security fix; 2.9.0-alpha04 added non-reified KClass overloads additively). Type-safe APIs are additive and "more robust" per docs.
  - Verdict: **PASS** (no deprecation) — but course should present string routes as legacy-supported, type-safe as recommended.
- `Icons.Default.ArrowBack` (directional Material icons):
  - Source: https://developer.android.com/jetpack/androidx/releases/compose-material?hl=en — Version 1.6.0-alpha05 (September 6, 2023): "Added support for auto-mirrored icons when rendered in right-to-left layouts... The new sets are prefixed with Icons.AutoMirrored.Filled... The previously provided icon properties for those icons are now marked as deprecated, and provides a replacement-block suggestion to help with the migration... For example, Icons.Filled.ArrowBack should be refactored to Icons.AutoMirrored.Filled.ArrowBack."
  - Also: compose BOM mapping page (https://developer.android.com/develop/ui/compose/bom/bom-mapping?hl=en, checked 2026-09-08) pins `material-icons-core` / `material-icons-extended` at frozen **1.7.8** across every BOM (through 2026.08.00) — icon libraries are frozen (inference from mapping table; no explicit footnote).
  - Verdict: **UPDATE_REQUIRED** if course uses `Icons.Default.ArrowBack` → use `Icons.AutoMirrored.Filled.ArrowBack` (deprecated since Compose Material 1.6.0-alpha05, 2023).
- Material 2 `BottomNavigation` / `BottomNavigationItem`:
  - Source (authoritative for current status): androidx-main source file compose/material/material/.../BottomNavigation.kt (fetched 2026-09-08) — **NOT @Deprecated** as of today; Material 2 latest stable is 1.12.0 (2026-08-12) and its release notes contain no BottomNavigation deprecation.
  - Current Material 3 stable: material3 **1.4.0**; M3's equivalent composable is `androidx.compose.material3.NavigationBar`.
  - Verdict: **PASS/nuance** — teaching M2 `BottomNavigation` is not deprecated-error material, but a 2026 course teaching a Compose bottom bar should prefer Material 3 `NavigationBar`; phrase M2 as legacy, not "deprecated".

## 16. navigate() in callback, not composable body (UDF)

- Source: https://developer.android.com/guide/navigation/use-graph/navigate?hl=en, checked 2026-09-08
- Exact quotes (both warnings still present verbatim):
  > "Warning: You should only call navigate() as part of a callback and not as part of your composable itself. This avoids calling navigate() on every recomposition."
  > "Warning: Don't pass your NavController to your composables. Expose an event as described here."
  > "According to Unidirectional Data Flow (UDF) principles, the composable should instead expose an event that the NavController handles."
- Pattern: screen takes `onNavigateToFriends: () -> Unit`; NavHost wires `onNavigateToFriends = { navController.navigate(route = FriendsList) }`.
- Verdict: **PASS** (guidance unchanged; cite with confidence).

## 17. Kotlin serialization: plugin + @Serializable (kotlinlang.org)

- Source: "Get started with serialization" — https://kotlinlang.org/docs/serialization-get-started.html (checked 2026-09-08); overview at https://kotlinlang.org/docs/serialization.html
- Exact quotes/snippets:
  ```kotlin
  plugins {
      kotlin("plugin.serialization") version "2.4.20"
  }
  // Groovy: id 'org.jetbrains.kotlin.plugin.serialization' version '2.4.20'
  implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
  ```
  > "To make a class serializable, you need to mark it with the @Serializable annotation. This annotation instructs the compiler to generate the code required for serializing and deserializing instances of the class."
  > "To include the kotlinx.serialization library in your project, add the corresponding plugin and dependency configuration based on your build tool"
  - Imports shown (wildcards only): `import kotlinx.serialization.*` / `import kotlinx.serialization.json.*`
- Note: plugin id `org.jetbrains.kotlin.plugin.serialization` confirmed on kotlinlang (Groovy form) and on developer.android.com setup (both forms). kotlinx.serialization versions independently of Kotlin.
- Verdict: **PASS** (requirement statement confirmed on kotlinlang; Android-side canonical snippets: plugin `kotlin("plugin.serialization")`, runtime `kotlinx-serialization-json`).

## 18. rememberNavController placement

- Source: https://developer.android.com/guide/navigation/navcontroller?hl=en, checked 2026-09-08
- Exact quotes:
  > "You should create the NavController high in your composable hierarchy. It needs to be high enough that all the composables that need to reference it can do so."
  > "Doing so lets you to use the NavController as the single source of truth for updating composables outside of your screens. This follows the principles of state hoisting."
  > "To create a NavController when using Jetpack Compose, call rememberNavController()"
  ```kotlin
  val navController = rememberNavController()
  ```
- Caveat: the "Don't pass your NavController to your composables" warning is NOT on the navcontroller page — it lives on /guide/navigation/use-graph/navigate (topic 16). Don't cite navcontroller page for that claim.
- Verdict: **PASS**.

---

## Final summary

### Stale claims a Navigation-2.7.2-era course must fix (Stage 4)

1. **Version pins**: `2.7.2` → current stable **2.10.0** (2026-08-26) in all dependency snippets.
2. **Maintenance mode**: Nav2 releases page now says the library "is in maintenance mode and will only receive critical fixes; new features are not planned." Course should mention this when introducing Nav2.
3. **String routes as the primary teaching pattern**: not deprecated, but current docs call type-safe routes "more robust" — course should lead with `@Serializable` routes + `composable<T>` and mark string routes as legacy-supported.
4. **Argument retrieval via `arguments?.getString` + `navArgument()`/`NavType`**: not deprecated, but current recommended pattern is `backStackEntry.toRoute<T>()` and `SavedStateHandle.toRoute<T>()`; docs explicitly say "there's no need for NavArgument" with type-safe routes.
5. **Serialization setup missing or versioned old**: add `kotlin("plugin.serialization")` + `org.jetbrains.kotlinx:kotlinx-serialization-json` (official snippets currently: plugin 2.0.21, json 1.7.3; kotlinlang examples: 2.4.20 / 1.11.0). Type-safe APIs exist since 2.8.0 (2024-09-04).
6. **`Icons.Default.ArrowBack`**: deprecated since Compose Material 1.6.0-alpha05 (2023-09-06) → `Icons.AutoMirrored.Filled.ArrowBack`. (material-icons artifacts frozen at 1.7.8 in every BOM through 2026.08.00.)
7. **Material 2 `BottomNavigation`**: not deprecated (verified in androidx-main source today), but Material 3 `NavigationBar` (material3 1.4.0) is the current-standard component — present M2 as legacy.
8. **Navigation 3**: must be mentioned — stable since 1.0.0 (2025-11-19), described officially as "a new navigation library designed to work with Compose" / "the AndroidX Compose first approach to navigation", with an official migration guide (NavHost→NavDisplay, composable\<T\>→entry\<T\>, popBackStack→goBack). Avoid claiming "replacement/next generation" as an official quote — those words don't appear.

### Current exact version numbers (as of 2026-09-08)

| Library | Latest stable | Date | Pre-release |
|---|---|---|---|
| androidx.navigation (Nav 2.x) | **2.10.0** | 2026-08-26 | none active (maintenance mode) |
| androidx.navigation3 (Nav 3) | **1.1.7** | 2026-08-26 | 1.2.0-beta01 (2026-08-26) |
| Nav3 stability milestones | 1.0.0 stable | 2025-11-19 | 1.1.0 stable 2026-04-08 |
| androidx.compose.material (M2) | 1.12.0 | 2026-08-12 | 1.13.0-alpha02 |
| androidx.compose.material3 | 1.4.0 | (stable; latest update 2026-08-26) | 1.5.0-alpha27 |
| material-icons-core/extended (frozen) | 1.7.8 | — | pinned in all BOMs incl. 2026.08.00 |
| Compose BOM (docs example) | 2026.08.00 | 2026-09-01 page update | — |
| kotlinx-serialization-json (Android docs / kotlinlang) | 1.7.3 / 1.11.0 | — | — |
| kotlin serialization plugin (Android docs / kotlinlang) | 2.0.21 / 2.4.20 | — | — |

### Surprises vs stated expectations

- Nav2 expectation "~2.10.x" confirmed exactly: **2.10.0 (2026-08-26)**.
- Nav3 expectation "1.0.0 stable 19/11/2025, latest ~1.1.x" confirmed and updated: 1.0.0 stable date was right, latest stable is **1.1.7 (2026-08-26)** and 1.2.0 is in beta.
- Unexpected (new since course-era): Nav2 releases page now carries the explicit **maintenance-mode Caution** — the single strongest official statement that Nav2 is legacy.
- `BottomNavigation` (M2) is still NOT deprecated despite common assumption; the hard deprecation is only on `Icons.Filled.ArrowBack` (AutoMirrored) and friends.
- No Navigation 2.8–2.10 release deprecated anything (`deprecat*` zero hits across release notes).
