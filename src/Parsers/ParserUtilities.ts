interface ToNextNumberResults
{
    index: number;
    num: number;
}

export class ParserUtilities
{

    static ToNextNumber(text: string[], startIndex: number = 0): ToNextNumberResults
    {

        let i = 0;
        for (i = startIndex; i < text.length; i++)
        {
            if (/-?[0-9]+.?[0-9]*/g.test(text[i]))
            {
                return { num: parseFloat(text[i]), index: ++i }
            }
        }

        return { num: 0, index: i };
    }
}