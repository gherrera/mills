const generatePassword = (
  length = 10,
  upper = true,
  lower = true,
  symbols = false,
  nums = true) => {

  const charSets = {
      upper: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
      lower: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      special: ["!", "#", "$", "%", "&", "*", ".", "/", "?", "@", "_",]
  };

  const generatePassword = () =>{
      let password = "";
      while (password.length < length) {
          const char = generateX();
          if (char) {
              password += char;
          }
      }
      return password;
  }

  const generateX = () => {
      const randomBranch = Math.floor(Math.random() * 4);

      switch (randomBranch) {
          case 0:
              if (nums === true) {
                  return num();
              }
              break;
          case 1:
              if (upper === true) {
                  return upperCase();
              }
              break;
          case 2:
              if (lower === true) {
                  return lowerCase();
              }
              break;
          case 3:
              if (symbols === true) {
                  return symbolCase();
              }
              break;
          default:
              throw new Error("Something went wrong!!");
      }
  }

  const randomFromCharSet = (chars) => {
      const random = Math.floor(Math.random() * chars.length);
      return chars[random];
  }

  const num = () => {
      return Math.floor(Math.random() * 9);
  }

  const lowerCase = () => {
      const chars = charSets.lower;
      return randomFromCharSet(chars);
  }

  const upperCase= () => {
      const chars = charSets.upper;
      return randomFromCharSet(chars);
  }

  const symbolCase= () => {
      const chars = charSets.special;
      return randomFromCharSet(chars);
  }

  return generatePassword();
}

export default generatePassword;