class Miscellaneous {
    static IsCharAlphaNumeric(charToCheck) {
        if (charToCheck >= '0' && charToCheck <= '9')
            return true;

        if (charToCheck >= 'a' && charToCheck <= 'z')
            return true;

        if (charToCheck >= 'A' && charToCheck <= 'Z')
            return true;

        return false;
    }

    static IsCharSpace(charToCheck) {
        return (charToCheck == ' ');
    }
}