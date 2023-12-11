import fs from "fs/promises";

export async function deleteFolders(folders: string[]) {
    if (folders.length <= 0) return { numberCompleted: 0, numberRejected: 0 };
    const promises = folders.map((value) => {
        return new Promise<boolean>((resolve, reject) => {
            fs.rmdir(value)
                .then((res) => {
                    resolve(true);
                })
                .catch((error) => {
                    reject({ folder: value, reason: error });
                });
        });
    });
    try {
        const results = await Promise.allSettled(promises);
        const numberCompleted = results.filter((value) => value.status === "fulfilled").length;
        const numberRejected = results.length - numberCompleted;
        return { numberCompleted, numberRejected };
    } catch (error) {
        return { numberCompleted: 0, numberRejected: folders.length };
    }
}
