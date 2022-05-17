const validateEmail = (email: string): boolean => {
  var re = /\S+@\S+\.\S+/;
  console.log("testing email");
  return re.test(email);
};

export { validateEmail };
