import { FiscalCode } from "./codice-fiscale.vo.js";

export interface FiscalCodeGeneratorInput {
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: 'M' | 'F';
  birthPlaceCode: string; // codice catastale comune
}

export class FiscalCodeGenerator {
  private static OMOCODIA_MAP = ['L','M','N','P','Q','R','S','T','U','V'];

  /**
   * Genera il CF principale + eventuali omocodie
   */
  public static generateAll(input: FiscalCodeGeneratorInput): FiscalCode[] {
    const baseCode = this.buildCode(input);
    const controlChar = this.calculateControlChar(baseCode);
    const mainCF = FiscalCode.create(baseCode + controlChar);

    const variants = this.generateOmocodie(baseCode);

    return [mainCF, ...variants];
  }

  /**
   * Genera varianti omocodie
   */
  private static generateOmocodie(baseCode: string): FiscalCode[] {
    const positions = [6,7,9,10,12,13,14]; // posizioni dove applicare omocodia
    const results: FiscalCode[] = [];

    const generateRecursive = (codeArr: string[], posIndex: number) => {
      if (posIndex >= positions.length) {
        const cf = codeArr.join('') + this.calculateControlChar(codeArr.join(''));
        results.push(FiscalCode.create(cf));
        return;
      }

      const pos = positions[posIndex];
      const char = codeArr[pos];

      if (/\d/.test(char)) {
        // sostituisci con lettera mappa omocodia
        for (const replacement of this.OMOCODIA_MAP) {
          const newArr = [...codeArr];
          newArr[pos] = replacement;
          generateRecursive(newArr, posIndex + 1);
        }
      } else {
        generateRecursive(codeArr, posIndex + 1);
      }
    };

    generateRecursive(baseCode.split(''), 0);
    return results;
  }

  private static buildCode(input: FiscalCodeGeneratorInput): string {
    const surname = this.encodeSurname(input.lastName);
    const name = this.encodeName(input.firstName);
    const date = this.encodeBirthDate(input.birthDate, input.gender);
    const place = input.birthPlaceCode.toUpperCase();

    return `${surname}${name}${date}${place}`;
  }

  private static encodeSurname(surname: string): string {
    return this.encodeNameOrSurname(surname);
  }

  private static encodeName(name: string): string {
    const consonants = name.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '').toUpperCase();
    if (consonants.length >= 4) {
      return consonants[0] + consonants[2] + consonants[3];
    }
    return this.encodeNameOrSurname(name);
  }

  private static encodeNameOrSurname(str: string): string {
    const consonants = str.replace(/[^BCDFGHJKLMNPQRSTVWXYZ]/gi, '').toUpperCase();
    const vowels = str.replace(/[^AEIOU]/gi, '').toUpperCase();
    return (consonants + vowels + 'XXX').slice(0, 3);
  }

  private static encodeBirthDate(date: Date, gender: 'M' | 'F'): string {
    const y = date.getFullYear().toString().slice(-2);
    const m = this.monthCode(date.getMonth() + 1);
    let d = date.getDate();
    if (gender === 'F') d += 40;
    const day = d.toString().padStart(2, '0');
    return `${y}${m}${day}`;
  }

  private static monthCode(month: number): string {
    const months = ['A','B','C','D','E','H','L','M','P','R','S','T'];
    return months[month - 1];
  }

  private static calculateControlChar(code15: string): string {
    const evenMap: Record<string, number> = {
      '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,
      A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25
    };
    const oddMap: Record<string, number> = {
      '0':1,'1':0,'2':5,'3':7,'4':9,'5':13,'6':15,'7':17,'8':19,'9':21,
      A:1,B:0,C:5,D:7,E:9,F:13,G:15,H:17,I:19,J:21,K:2,L:4,M:18,N:20,O:11,P:3,Q:6,R:8,S:12,T:14,U:16,V:10,W:22,X:25,Y:24,Z:23
    };
    let sum = 0;
    for (let i = 0; i < code15.length; i++) {
      const char = code15[i];
      sum += i % 2 === 0 ? oddMap[char] : evenMap[char];
    }
    return String.fromCharCode((sum % 26) + 65);
  }
}
