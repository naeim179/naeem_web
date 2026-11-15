export function categoryLabel(value: string) {
  return (
    (
      {
        Reverse: "Reverse engineering",
        Crypto: "Cryptography",
        Pwn: "Binary exploitation",
        Misc: "Miscellaneous",
        Web: "Web security",
      } as Record<string, string>
    )[value] ?? value
  );
}
