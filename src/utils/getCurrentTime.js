const getCurrentTime = () => {
	let today = new Date();

	let dd = today.getDate();
	let mm = today.getMonth() + 1;
	let yyyy = today.getFullYear();

	today = dd + "-" + mm + "-" + yyyy;
	return today;
};

module.exports = { getCurrentTime };
