\# Dokumentacja Architektoniczna



\## Decyzje Projektowe



\### 1. Proceduralne Generowanie Toru

Zamiast statycznych map, zastosowano algorytm generujący zamkniętą pętlę oparty na:

\* \*\*Radial Noise Generation:\*\* Punkty kontrolne są generowane na okręgu z losowym zaburzeniem promienia.

\* \*\*Catmull-Rom Splines:\*\* Punkty są interpolowane w celu uzyskania gładkiej krzywizny (G1 continuity), co jest kluczowe dla zachowania fizyki jazdy.



\### 2. AI (Sztuczna Inteligencja)

Boty nie poruszają się po sztywnych ścieżkach ("rails").

\* \*\*Lookahead System:\*\* Bot analizuje wektor styczny toru w punkcie oddalonym o `AI\_LOOKAHEAD`.

\* \*\*Analiza Krzywizny:\*\* Bot oblicza iloczyn skalarny (dot product) wektora prędkości i wektora celu, aby przewidzieć ostrość zakrętu i dostosować prędkość \*przed\* wejściem w łuk.



\### 3. System Detekcji Okrążeń

Aby wyeliminować błędy "migotania" na linii startu, zastosowano system sektorowy.

\* Pojazd musi zaliczyć "Checkpoint Połowy" (50% długości splajnu).

\* Dopiero po zaliczeniu checkpointa, przekroczenie indeksu 0 (pętla tablicy) zalicza okrążenie.

