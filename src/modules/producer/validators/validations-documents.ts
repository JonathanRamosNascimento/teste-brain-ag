import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidationsDocuments {
  isValidDocument(document: string): boolean {
    const cleanDocument = document.replace(/\D/g, '');

    if (cleanDocument.length === 11) {
      return this.isValidCPF(cleanDocument);
    } else if (cleanDocument.length === 14) {
      return this.isValidCNPJ(cleanDocument);
    }

    return false;
  }

  private isValidCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(.)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
    return checkDigit === parseInt(cpf.charAt(10));
  }

  private isValidCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(.)\1+$/.test(cnpj)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(cnpj.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return checkDigit === parseInt(cnpj.charAt(13));
  }
}
