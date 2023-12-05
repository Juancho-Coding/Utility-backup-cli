import fs from "fs/promises";
export async function deleteFolders(folders: string[]) {
    if (folders.length <= 0) return { result: true, reason: "" };
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
        const results = await Promise.all(promises);
        return { result: true, reason: "" };
    } catch (error) {
        return { result: false, reason: error };
    }
}
