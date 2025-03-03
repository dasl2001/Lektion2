# Gruppuppgift: Versionshantering och Test-Driven Development

## Översikt

Detta är en gruppuppgift där ni ska arbeta med versionshantering i Git samtidigt som ni vidareutvecklar en Express/MongoDB-applikation. Applikationen är en produkt-API som behöver förbättras och fixas.

## Uppgiftssekvens

Följ dessa steg i ordning:

1. **Fork & Setup**

   - Forka detta repository till er grupps GitHub
   - Lägg till gruppmedlemmar som collaborators
   - Klona ert forkade repo lokalt

2. **Branch-strategi**

   - Använd feature branches för varje ny funktionalitet
   - Namnge branches beskrivande: `feature/search-filter`, `fix/failing-tests`, `feature/add-category`
   - Huvudbranchen (main) ska alltid vara stabil

3. **Implementera Sökfilter**

   - Skapa en ny feature branch
   - Implementera sökfunktionalitet för produkter i Express
   - Exempel: sökning på namn, prisfiltreringar, etc.
   - Skapa relevanta tester för den nya funktionaliteten

4. **Fixa Existerande Tester**

   - Flera tester i projektet är felaktiga
   - Som exempel på ett problem ni kommer stöta på:

   ```javascript
   // Detta test förväntar sig att priset 99.99 ska vara exakt 99.99999
   test("should validate a valid product", async () => {
     const validProduct = new Product(validProductData);
     const savedProduct = await validProduct.save();
     expect(savedProduct.price).toBe(99.99999); // Kommer detta fungera? Varför/Varför inte?
   });
   ```

   - Identifiera och åtgärda övriga testproblem

5. **Utöka Produktmodellen**

   - Lägg till kategori-funktionalitet
   - Uppdatera MongoDB-modellen
   - Uppdatera relevanta API-endpoints
   - Anpassa och utöka testerna
   - OBS: Detta kommer påverka hela API:et!

6. **Pull Requests & Code Review**

   - Skapa en PR för varje färdig feature
   - Minst en annan gruppmedlem måste reviewea koden
   - Använd GitHub:s PR-funktionalitet
   - Dokumentera diskussioner och beslut i PR:en

7. **Merge Conflict Hantering**
   - Konflikter kommer uppstå, särskilt kring produktmodellen
   - Lös konflikter i gruppen
   - Dokumentera hur ni hanterar konflikterna i PROCESS.md

## Teknisk Setup

1. Klona ert forkade repo
2. Installera dependencies: `npm install`
3. Starta MongoDB lokalt: `brew services start mongodb-community`
4. Kör testerna: `npm test`

## Tips för Git-workflow

```bash
# Börja med ny feature
git checkout -b feature/search-filter

# Håll din branch uppdaterad
git pull origin main

# Pusha ändringar
git push origin feature/search-filter

# Vid merge conflicts
git fetch origin
git merge origin/main
# Lös konflikter, commit och push
```