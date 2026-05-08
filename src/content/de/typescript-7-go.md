---
title: "TypeScript 7 ist fast da – was sich ändert und was Go damit zu tun hat"
description: "Das TypeScript-Team portiert den Compiler nach Go – und erreicht damit bis zu 10x schnellere Build-Zeiten. Was TypeScript 6 und 7 bedeuten, warum Go gewählt wurde, und was das für den Entwickleralltag heißt."
category: Technical
date: 2026-04-01
readTime: "14 min"
image: "/articles/typescript-7-go/typescript-go-thumb.png"
lang: de
translationSlug: typescript-7-go-en
---

## 1 Einleitung

Seit 2023 ist Typescript 5 die neuste Typescript Version. Größere Änderungen an Typescript hat es länger nicht mehr gegeben. Doch seit Anfang 2025 ist im TypeScript-Ökosystem einiges in Bewegung geraten. Zunächst eher unbeachtet, dann immer lauter: Das TypeScript-Team arbeitet an einer nativen Implementierung des Compilers – und die kommt nicht in TypeScript, sondern in **Go**. Und sie ist schnell. Sehr schnell. Bis zu zehnmal schneller.

Was genau hinter TypeScript 6 und TypeScript 7 steckt, warum Go dabei eine zentrale Rolle spielt, und was das für euren Arbeitsalltag bedeutet – darum geht es in diesem Artikel.

## 2 TypeScript 6: Die Brücke, die kaum jemand bemerkt hat

Am 23. März 2026 hat das TypeScript-Team TypeScript 6.0 veröffentlicht. Wer auf ein großes Feature-Release gehofft hat, wurde auf den ersten Blick enttäuscht. TypeScript 6 ist bewusst kein Feature-Release – es ist ein **Übergangs-Release**.

Das TypeScript-Team beschreibt 6.0 selbst als „Bridge" zwischen TypeScript 5.9 und TypeScript 7. Die Hauptaufgabe von TypeScript 6: alles zu deprecaten, was in TypeScript 7 nicht mehr unterstützt wird. Dazu gehören unter anderem:

- `--target es5` (ES2015 ist die neue Untergrenze)
- `--moduleResolution node` / `node10`
- `--baseUrl` als Lookup-Root für Module
- `--outFile` (Bundler machen das heute besser)
- `--module amd`, `umd`, `systemjs`
- `module`-Syntax für Namespaces (statt `namespace`)
- `esModuleInterop: false` und `allowSyntheticDefaultImports: false`

Gleichzeitig ändert TypeScript 6 einige Defaults, die jahrelang umstritten waren: `strict` ist jetzt standardmäßig `true`, `module` defaultet auf `esnext`, und `types` defaultet auf ein leeres Array anstatt auf alle `@types`-Pakete in `node_modules` – was bei vielen Projekten allein schon die Build-Zeit um 20–50 % verbessert.

Der entscheidende Punkt: Wer TypeScript 7 einsetzen will, sollte zuerst auf TypeScript 6 migrieren. Wer die Deprecation-Warnings aus TypeScript 6 ignoriert, wird mit TypeScript 7 auf Probleme stoßen.

Für eine sanfte Migration gibt es `"ignoreDeprecations": "6.0"` in der `tsconfig.json`, das alle neuen Fehler fürs Erste stumm schaltet – aber nicht für immer.

## 3 TypeScript 7: Kein Rewrite, sondern ein Port

Jetzt zum eigentlichen Star: TypeScript 7. Seit März 2025 arbeitet das TypeScript-Team intern an einem Projekt namens **„Corsa"** – einer nativen Implementierung des TypeScript-Compilers. Nicht in TypeScript, nicht in C++, sondern in **Go**.

Einen wichtigen Punkt gibt es bei dieser neuen Codebase: Die Go-Version es Compilers ist **kein Rewrite**. Es ist ein **Port**. Der bestehende TypeScript-Code wurde nicht neu gedacht oder von Grund auf neu designed. Er wurde – mit dem Ziel möglichst hoher Äquivalenz – **in Go übertragen**.

Das hat einen wichtigen Vorteil: Viele implizite Verhaltensweisen, Inferenzregeln und Edge Cases des TypeScript-Typsystems, die in der JavaScript-Implementierung über Jahre gewachsen sind, bleiben erhalten. Die Chancen stehen gut, dass TypeScript 7 bestehende Codebases aus dem Stand korrekt typcheckt – ohne dass man sich auf „neue Semantik" einstellen muss.

Das TypeScript-Team hat diesen Anspruch auch mit Zahlen untermauert: Von rund 20.000 Compiler-Testfällen, die in TypeScript 6 mindestens einen Fehler erzeugen, reproduziert TypeScript 7 in **all bis auf 74 Fällen** dieselben Fehler. Die 74 verbleibenden Abweichungen sind entweder noch ausstehende Portierungsarbeit oder absichtliche Änderungen im Zusammenhang mit den neuen Defaults.

## 4 Warum Go – und was hat Concurrency damit zu tun?

Die Frage liegt nahe: Warum Go? TypeScript hätte auch in Rust, C++ oder als WASM-Modul neu implementiert werden können.

Die Antwort des TypeScript-Teams ist pragmatisch. Go bietet mehrere Vorteile, die für diesen spezifischen Anwendungsfall besonders relevant sind:

**Native Kompilierung:** Go-Code wird zu nativen Binaries kompiliert. Statt eine JavaScript-Engine zu starten, die dann TypeScript interpretiert, läuft der neue Compiler als direkter Maschinencode – ohne Overhead durch V8 oder ähnliche Runtimes.

**Shared-Memory-Parallelismus:** Go hat ein robustes Goroutinen-Modell, das echtes Multi-Threading mit geteiltem Speicher ermöglicht. Das ist entscheidend: TypeScript-Typechecking ist nicht trivial zu parallelisieren – es gibt Abhängigkeiten zwischen Dateien und Projekten. Go erlaubt es aber, viele Teile des Checks tatsächlich gleichzeitig auszuführen. Das bedeutet nicht nur, dass einzelne Projekte schneller gecheckt werden – es können auch mehrere Projekte **parallel** gebaut werden.

**Geringerer Speicherbedarf:** Die native Implementierung benötigt laut ersten Messungen nur etwa **halb so viel Speicher** wie die JavaScript-Variante.

Das Ergebnis ist eindrucksvoll. Hier ein Auszug aus den gemessenen Speedups auf echten Codebases:

| Codebase   | tsc (JS)  | tsgo (nativ) | Speedup |
|------------|-----------|--------------|---------|
| VS Code    | 77,8 s    | 7,5 s        | 10,4x   |
| Playwright | 11,1 s    | 1,1 s        | 10,1x   |
| TypeORM    | 17,5 s    | 1,3 s        | 13,5x   |
| date-fns   | 6,5 s     | 0,7 s        | 9,5x    |
| rxjs       | 1,1 s     | 0,1 s        | 11,0x   |

Anders Hejlsberg (leitender Architekt von Typescript) sagt, dass die native Implementierung für etwas die Hälfte des Speedups verantwortlich ist (ca. 3x), während die andere Hälfte auf die Nebenläufigkeit zurückzuführen ist(ca. 3x).

Auch der Language Server profitiert erheblich. Die Zeit, bis ein großes Projekt im Editor vollständig geladen ist, fällt beim VS-Code-Codebase von rund 9,6 Sekunden auf etwa **1,2 Sekunden** – ein 8-faches Speedup. Das ist gerade bei größeren Projekten ein Riesen Vorteil.

## 5 Eine KI-getriebene Zukunft für Ports?

Hier lohnt es sich, kurz innezuhalten und einen Gedanken zuzulassen: Ein derart komplexes Stück Software – der TypeScript-Compiler mit all seinen Spezialfällen, Inferenzregeln und impliziten Verhaltensweisen – wurde im Wesentlichen von einer Sprache in eine andere übertragen. Und das mit einem hohen Grad an semantischer Äquivalenz.

Man fragt sich unwillkürlich: Hätte das vor einigen Jahren, ohne moderne KI-Unterstützung, ähnlich schnell funktioniert?

Code-Translations dieser Art – nicht das Neuschreiben von Logik, sondern das Übertragen von bestehendem, gut verstandenem Code in eine andere Sprache – sind genau die Art von Aufgabe, bei der AI-Assistenten enorm helfen können. Ob ein ähnliches Vorgehen mit neuartigen Modellen im Rücken zukünftig auch für andere Kern-Infrastrukturen des Webs denkbar wäre – Legacy-Code, der weiterhin mit möglichst hoher Kompatibilität gebraucht wird, aber in einer performanteren oder populäreren Sprache geschrieben werden soll – ist zumindest eine Überlegung wert.

## 6 Aktueller Stand und was noch fehlt

TypeScript 7 ist bereits heute als native Preview verfügbar – und reifer als man vielleicht erwarten würde. Über npm lässt sie sich installieren:

```bash
npm install -D @typescript/native-preview
```

Das Paket stellt einen `tsgo`-Befehl bereit, der analog zu `tsc` funktioniert und parallel dazu betrieben werden kann.

Auch der Language Server ist als VS-Code-Extension im Marketplace verfügbar und wird täglich aktualisiert. Bereits implementiert sind unter anderem:

- Code Completions (inkl. Auto-Imports)
- Go-to-Definition und Go-to-Implementation
- Find-All-References
- Rename
- Quick Fixes für fehlende Imports
- Formatting

Es gibt jedoch noch offene Punkte, die vor dem finalen Release adressiert werden müssen:

**JS Emit:** Die JavaScript-Ausgabe ist noch nicht vollständig portiert. Wer TypeScript nur zum Type-Checking verwendet und das Transpiling einem anderen Tool (Babel, esbuild, Vite) überlässt, ist bereits heute gut bedient. Wer auf TypeScript's eigene Transpilierung angewiesen ist – besonders für ältere Targets – muss noch warten.

**Compiler-API:** Die bestehende TypeScript-API (die sogenannte Strada API) wird von TypeScript 7 nicht unterstützt. Tools wie Linter, Formatter oder IDE-Plugins, die auf diese API angewiesen sind, werden vorerst nicht mit TypeScript 7 funktionieren. Eine neue Corsa-API ist in Entwicklung, aber noch nicht stabil.

**Watch-Modus:** Der `--watch`-Modus der nativen Implementierung ist in einigen Szenarien noch weniger effizient als der bestehende. Als Workaround kann `tsgo --incremental` in Kombination mit einem eigenen File-Watcher (z. B. `nodemon`) verwendet werden.

**JSDoc und JavaScript-Dateien:** Wer JavaScript-Projekte mit JSDoc-Annotationen und TypeScript-Checking betreibt, sollte wissen, dass einige weniger verbreitete JSDoc-Tags und Patterns nicht unterstützt werden (z. B. `@enum`, `@constructor`). Hier kann TypeScript 7 mehr Fehler melden als erwartet.

## 7 Was TypeScript 6 mit TypeScript 7 inkompatibel macht

TypeScript 7 übernimmt die Deprecations aus TypeScript 6 als harte Breaking Changes. Wer auf folgende Konfigurationen angewiesen ist, muss migrieren, bevor TypeScript 7 produktiv eingesetzt werden kann:

- `--target es5` → mindestens `es2015` verwenden
- `--moduleResolution node10` → auf `nodenext` oder `bundler` migrieren
- `--baseUrl` als Module-Lookup-Root
- `--outFile`
- `--module amd`, `umd`, `systemjs`
- `esModuleInterop: false`

Für viele dieser Punkte hilft das experimentelle Tool `ts5to6`, das Teile der `tsconfig.json` automatisch anpasst:

```bash
npx @andrewbranch/ts5to6 --fixBaseUrl tsconfig.json
npx @andrewbranch/ts5to6 --fixRootDir tsconfig.json
```

Außerdem führt TypeScript 7 aufgrund des parallelen Type-Checkings eine deterministische Reihenfolge für Union Types ein. In sehr seltenen Fällen kann sich dadurch die Ausgabe von Declaration Files minimal verändern oder ein zuvor „zufällig" funktionierender Typfehler plötzlich sichtbar werden. Mit dem Flag `--stableTypeOrdering` in TypeScript 6 lässt sich das Verhalten von TypeScript 7 vorab simulieren – als Diagnosemittel für die Migration.

## 8 Wann kommt TypeScript 7?

Das TypeScript-Team war überraschend klar mit dem Zeitplan. TypeScript 6 wurde im März 2026 veröffentlicht und ist explizit das **letzte JS-basierte Release** – es wird kein TypeScript 6.1 geben (nur ggf. Patch-Releases für kritische Bugs und Sicherheitslücken).

TypeScript 7 ist das nächste Major Release. Der Stand im Dezember 2025 war vielversprechend: Typechecking läuft stabil und ist nahezu feature-complete, Language-Service-Features werden täglich ergänzt. Das Team sprach davon, TypeScript 7 „innerhalb weniger Monate" nach TypeScript 6 zu veröffentlichen – was das finale Release voraussichtlich in den Bereich **Mitte bis Ende 2026** rückt.

Der Upgrade-Pfad ist dabei bewusst graduell gestaltet. TypeScript 6 und TypeScript 7 können parallel eingesetzt werden – z. B. TypeScript 7 für schnelles Command-Line-Checking im CI, TypeScript 6 für Tools, die auf die alte Compiler-API angewiesen sind.

## 9 Was bedeutet das für den Alltag als Entwickler?

Der praktische Nutzen lässt sich auf drei Punkte herunterbrechen:

**Schnellere Build-Pipelines.** CI/CD-Runs, die bisher 80 Sekunden TypeScript-Checking gekostet haben, könnten auf unter 10 Sekunden fallen. Das ist kein marginaler Gewinn – das verändert, wie Teams Feedback-Loops strukturieren und wie schnell Entwickler:innen Rückmeldung auf ihre Änderungen bekommen.

**Flüssigeres Arbeiten im Editor.** Der Language Server startet schneller, Autovervollständigung und Find-All-References antworten mit merklich weniger Verzögerung. Wer in großen Codebases arbeitet, weiß, wie störend Latenz in diesen Operationen ist. TypeScript 7 bewegt sich auf das LSP-Protokoll (Language Server Protocol) zu, was langfristig auch die Interoperabilität mit anderen Editoren verbessert.

**Bessere Grundlage für KI-gestützte Tools.** Das TypeScript-Team selbst hebt hervor, dass die neue Performance neue Möglichkeiten für AI-Tools öffnet: breitere semantische Kontextfenster, schnellere Indexierung ganzer Projekte, tiefere Analysen, die bislang zu teuer waren um sie in Echtzeit bereitzustellen. Das wird die nächste Generation von IDE-Features und KI-Assistenten direkt beeinflussen.

## 10 Fazit

TypeScript 7 ist kein Hype-Projekt – es ist handfeste Infrastruktur-Arbeit, die sich in messbaren Speedups niederschlägt. Der ungewöhnliche Ansatz, eine bestehende Codebasis in Go zu portieren statt sie neu zu schreiben, ist dabei bewusst gewählt: Er maximiert die semantische Kompatibilität und minimiert das Risiko für bestehende Projekte.

TypeScript 6 ist dabei weniger ein eigenständiges Release als ein notwendiger Zwischenschritt, um die Brücke ordentlich aufzuräumen. Wer jetzt auf TypeScript 5 sitzt und ohnehin einen Upgrade plant, sollte direkt auf 6 migrieren – und Deprecation-Warnings ernst nehmen, nicht per `ignoreDeprecations` wegdrücken.

Die native Preview kann bereits heute in vielen Projekten parallel eingesetzt werden. Wer keine besonderen Anforderungen an die Compiler-API oder JS Emit hat, kann `tsgo` im CI ausprobieren und damit schon jetzt ein Gefühl für die Größenordnung der Verbesserungen bekommen.

TypeScript 7 macht das entwickeln mit TypeScript schlicht schneller. Und das reicht für eine neue solide Version vollkommen aus. Wer tiefer einsteigen möchte, findet die originalen Artikel des Typescript Teams in den Ressourcen. Ebenfalls empfehlen kann ich euch ein Youtube Video indem Anders Hejlsberg die Änderungen erläutert.
