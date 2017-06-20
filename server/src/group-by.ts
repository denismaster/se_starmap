export function groupBy<T>(arr: Array<T>, getter: (value: T) => any)
{  
    let map = arr.reduce((prev: any, curr) => {
            let key = getter(curr) || "";
            let entry = prev[key]
            if (typeof entry === "undefined") {
                prev[key] = [curr]
            }
            else {
                entry.push(curr)
            }
            return prev;
        }, {});
    const groups = Object.keys(map).map(val => {
        return {
            key: val,
            values: map[val]
        }
    });
    return groups;
}