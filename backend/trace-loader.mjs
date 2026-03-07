export async function resolve(specifier, context, nextResolve) {
    console.log('Resolving:', specifier);
    try {
        return await nextResolve(specifier, context);
    } catch (err) {
        console.error('FAILED TO RESOLVE:', specifier);
        console.error(err.message);
        process.exit(1);
    }
}
