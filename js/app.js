// Budget Controller

var budgetController = (function() {
    
    // Expense Constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercent = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercent = function() {
        return this.percentage;
    };

    // Income Constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(typ, des, val) {
            var newItem, ID;
            
            // create new ID
            if (data.allItems[typ].length > 0) {
                ID = data.allItems[typ][data.allItems[typ].length - 1].id + 1;
            } else {
                ID =0;
            }
            
            // create new item based on type
            if (typ === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (typ === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // add to data structure
            data.allItems[typ].push(newItem);

            // return the new element
            return newItem;
        },

        calculateBudget: function() {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget:  income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(c) {
                c.calcPercent(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercents;
            allPercents = data.allItems.exp.map(function(c) {
                return c.getPercent();
            });
            return allPercents;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        deleteItem: function(typ, id) {
            var ids, index;
            ids = data.allItems[typ].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[typ].splice(index, 1);
            }
        },

        testing: function() {
            console.log(data);
        }
    };


})();

// User Interface Controller

var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn', 
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        deleteBtn: 'item__delete--btn',
        container: '.container',
        expensesPercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var locale = 'en-AU'
        var nf = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return (type === 'exp' ? '-' : '+') + ' ' + nf.format(num);
    };

    var nodeListForEach = function(list, callback) {
        for (var i =0; i <list.length; i++) {
            callback(list[i], i);
        }
    };

    // return the inputs from the browser
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            // create html string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert the html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', '+ DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type ='inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if (obj.percentage > 0 ) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercentLabel);

            nodeListForEach(fields, function(c, index) {
                if (percentages[index] > 0) {
                    c.textContent = percentages[index] + '%';
                } else {
                    c.textContent = '---';
                }
            });
        },

        displayDate: function() {
            var now = new Date();
            document.querySelector(DOMstrings.dateLabel).textContent = now.toLocaleString('default', { month: 'long'}) + ' ' + now.getFullYear();
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDesc + ',' +
                DOMstrings.inputValue);
            nodeListForEach(fields, function(c){
                c.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.addBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();

// Global App Controller

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListners = function() {
        var DOM = UIController.getDOMstrings();
        // click event on add button
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        // key press event
        document.addEventListener('keypress', function(e) {
            if (e.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {
        var budget;
        // calculate the budget
        budgetCtrl.calculateBudget();
        // return the budget
        budget = budgetCtrl.getBudget();
        // Display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        var percentages;
        // calculate percentages
        budgetCtrl.calculatePercentages();
        // read percentages from the budget controller
        percentages = budgetCtrl.getPercentages();
        // update the UI
        UICtrl.displayPercentages(percentages);

    };

    // Add item function 
    var ctrlAddItem = function() {
        var input, newItem, addItem;
        // get input data
        input = UIController.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // clear the fields
            UICtrl.clearFields();
            // calculate an dupdate budget
            updateBudget(); 
            // calculate and update percentages
            updatePercentages();
        }
    };

    // Delete item function
    var ctrlDeleteItem = function(e) {
        var itemID, splitID, type, id;
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        
            // delete item
            budgetCtrl.deleteItem(type, id);

            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update and show new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('application started');
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListners();
        }
    };
    

})(budgetController, UIController);

controller.init();