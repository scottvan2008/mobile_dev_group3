export function destination(destination_name: string):string {
    return `You are going to ${destination_name}`;
    }
export const vacation_price = (destination: string, days:number ):number => {
if (destination === "Hawaii") {
    return days * 200;
} else return 1000 * days;
}