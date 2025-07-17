export const convertirTexto = (texto: string): string => {
  const palabras = texto.split(' ');
  const textoConvertido = palabras.map((palabra) => {
    return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
  });

  return textoConvertido.join(' ');
}
