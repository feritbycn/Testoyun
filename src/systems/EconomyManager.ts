export interface LedgerEntry { id: string; type: string; amount: number; before: number; after: number; at: number; description: string }
export interface WalletSnapshot { balance: number; gold: number; ledger: LedgerEntry[]; processedIds: string[] }
export class EconomyManager {
  balance: number;
  gold: number;
  ledger: LedgerEntry[];
  private processedIds: Set<string>;
  constructor(snapshot?: Partial<WalletSnapshot>) {
    this.balance = Math.max(0, snapshot?.balance ?? 12000);
    this.gold = Math.max(0, snapshot?.gold ?? 25);
    this.ledger = snapshot?.ledger ?? [];
    this.processedIds = new Set(snapshot?.processedIds ?? []);
  }
  credit(amount: number, type: string, description: string, id = `${type}:${Date.now()}:${Math.random()}`) {
    if (!Number.isFinite(amount) || amount < 0 || this.processedIds.has(id)) return false;
    const before = this.balance; this.balance += amount; this.processedIds.add(id);
    this.ledger.push({ id, type, amount, before, after: this.balance, at: Date.now(), description }); return true;
  }
  debit(amount: number, type: string, description: string, id = `${type}:${Date.now()}:${Math.random()}`) {
    if (!Number.isFinite(amount) || amount < 0 || amount > this.balance || this.processedIds.has(id)) return false;
    const before = this.balance; this.balance -= amount; this.processedIds.add(id);
    this.ledger.push({ id, type, amount: -amount, before, after: this.balance, at: Date.now(), description }); return true;
  }
  creditGold(amount: number, type: string, description: string, id = `${type}:${Date.now()}:${Math.random()}`) {
    if (!Number.isFinite(amount) || amount < 0 || this.processedIds.has(id)) return false;
    const before = this.balance; this.gold += amount; this.processedIds.add(id);
    this.ledger.push({ id, type, amount: 0, before, after: this.balance, at: Date.now(), description: `${description} (+${amount} gold)` }); return true;
  }
  spendGold(amount: number, type: string, description: string, id = `${type}:${Date.now()}:${Math.random()}`) {
    if (!Number.isFinite(amount) || amount < 0 || amount > this.gold || this.processedIds.has(id)) return false;
    this.gold -= amount; this.processedIds.add(id);
    this.ledger.push({ id, type, amount: 0, before: this.balance, after: this.balance, at: Date.now(), description }); return true;
  }
  snapshot(): WalletSnapshot { return { balance: this.balance, gold: this.gold, ledger: this.ledger.slice(-100), processedIds: [...this.processedIds].slice(-500) }; }
}
