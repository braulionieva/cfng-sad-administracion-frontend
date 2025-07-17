
export const obtenerCasoHtml = (numeroCaso: string): string => {
    const caso = numeroCaso?.split('-')
    return `<div class="cfe-caso">${caso[0]}-<span>${caso[1]}-${caso[2]}</span>-${caso[3]}</div>`
}