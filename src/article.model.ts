/**
 * @description Base class for every main post article
 */
export class Article {

    public tel: string;
    public chiffre: string;
    public uniqueKey: string;

    /** Note that this should be the same as in your database */
    private readonly keyLength = 100;
    
    constructor(public title: string, public date: string, public description: string) {
        this.uniqueKey = this.evaluatedUniqueKey;
        this.evaluateContact();
    }

    get evaluatedUniqueKey(): string {
        let key = (`${(this.title.replace(/[^A-Za-z0-9]/g, '_') as string).toLowerCase()}_${this.date.replace(/\./g, '_')}`);
        while(key.length < this.keyLength) { key += '_' + key; }
        return key.substring(0, this.keyLength);
    }

    get isAboutCarport(): boolean {
        const keywords = ['TG-Stpl.', 'Stellplatz', 'Stpl.', 'Stplz', 'Stellp', 'Stell'];
        let result = false;
        keywords.forEach(keyword => {
            if(this.description.indexOf(keyword) !== -1) {
                result = true;
                console.log(keyword);
            }
        })
        return result;
    }

    private evaluateContact() {
        this.tel = this.description.indexOf('Tel.') !== -1 ? this.description.substring(this.description.indexOf('Tel.') + 4, this.description.length) : '';
        this.chiffre = this.description.indexOf('Chiffre') !== -1 ? this.description.substring(this.description.indexOf('Chiffre') + 8, this.description.length) : '';
    }
}
