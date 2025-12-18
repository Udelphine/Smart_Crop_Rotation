// Simple in-memory soil service
class SoilService {
  constructor() {
    this.soilHP = 50; // default threshold
  }

  getSoil() {
    return { hp: this.soilHP };
  }

  setSoil(hp) {
    const n = Number(hp);
    if (Number.isNaN(n)) throw new Error('Invalid hp value');
    this.soilHP = n;
    return { hp: this.soilHP };
  }

  checkAcidity(acidity) {
    const a = Number(acidity);
    if (Number.isNaN(a)) throw new Error('Invalid acidity');
    const match = a <= this.soilHP;
    return { acidity: a, soilHP: this.soilHP, match };
  }
}

module.exports = new SoilService();
