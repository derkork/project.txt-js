export default class IndexTracker {
    private values: Map<any, number> = new Map<any, number>();

    public getAndAdd(key: any): number {
        if (this.values.has(key)) {
            const result = this.values.get(key)!;
            this.values.set(key, result + 1);
            return result;
        }
        this.values.set(key, 1);
        return 0;
    }
}