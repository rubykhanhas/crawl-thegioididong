import fs from 'fs';
import fetch from 'node-fetch';

export const downloadMediaByUrl = async (url:string, fileName:string, dir = "")=> {
    // Check case folder wasn't create
    fs.mkdir(dir, { recursive: true }, (err) => {
        console.log(err);
    });
    const response = await fetch(url);
    const buffer = await response.buffer();
    fs.writeFile(`${dir}/${fileName}`, buffer, () => {
        console.log(`Saved ${fileName}!`);
    });
};

export const saveToJSON = async (data: any, fileName: string, dir = "") => {
    fs.mkdir(dir, { recursive: true }, (err) => {
        console.log(err);
    });
    const jsonData = JSON.stringify(data);
    fs.writeFile(`${dir+fileName}`,jsonData,'utf8', () => {
        console.log(`Saved to ${dir+fileName} (${jsonData.length}items)`);
    })
}