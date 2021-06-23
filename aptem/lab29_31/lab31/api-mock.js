

const telephoneNumbers = [
    {
        id: 1,
        number: "+375251234567"
    },
    {
        id: 2,
        number: "+375251234568"
    },
]

let newId = () => telephoneNumbers.map(telephone => telephone.id).sort((id1, id2) => -(id1 - id2))[0] + 1 || 1;

exports.create = ({number}) => {

    let newPhone = {
        id: newId(),
        number: number
    };

    telephoneNumbers.push(newPhone)

    return newPhone;

}

const PAGE_SIZE = 10;

exports.getPage = (page) => {

    const startIndex = PAGE_SIZE * page;

    let telephoneNumbersPage = telephoneNumbers.slice(startIndex, startIndex + PAGE_SIZE);

    return telephoneNumbersPage;

}

exports.checkNumberFormat = ({number}) => {
    if (!number) {
        return false;
    }
    else {
        return /^\+375(25|29|44)\d{7}$/.test(number);
    }
}

exports.checkUniqueness = ({id, number}) => {

    let telephoneWithSameNumber = telephoneNumbers.find(telephoneNumber => {
        return telephoneNumber.number == number;
    });

    //тут проверяю, является ли новый устанавливаемый номер тм ж, чтои с id (меняю тот же ноер, поэтмоу допустимая операция)
    if (id) {
        if (telephoneWithSameNumber) {
            return (telephoneWithSameNumber.id == id);
        }
        else {
            return true;
        }
    }
    else {
        return !telephoneWithSameNumber;
    }

}


exports.update = ({id, number}) => {



    const indexOfNumberToUpdate = telephoneNumbers.findIndex((el) => {
        return el.id == id;
    });

    if (indexOfNumberToUpdate >= 0) {

        const newNumber = {
            id: id,
            number: number
        };

        telephoneNumbers[indexOfNumberToUpdate] = newNumber;

        return newNumber;
    }
    else {
        return null;
    }
}



exports.deleteById = (id) => {

    const indexOfNumberToDelete = telephoneNumbers.findIndex(el => el.id == id);

    if (indexOfNumberToDelete >= 0) {

        telephoneNumbers.splice(indexOfNumberToDelete, 1);

        return true;
    }
    else {
        return false;
    }
}