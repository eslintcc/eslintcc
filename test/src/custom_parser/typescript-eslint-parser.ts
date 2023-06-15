interface IOptions {
    test: boolean
}


export function test(option: IOptions): string | boolean {
    if ('test' in option) {
        return option.test;
    } else {
        return 'test not in option';
    }
}
