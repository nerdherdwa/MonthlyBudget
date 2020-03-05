
// Budget Controller

var budgetController = (function() {
    
    // Expense Constructors
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Income Constructor
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
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
        expensesContainer: '.expenses__list'
    };

    // return the inputs from the browser
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: document.querySelector(DOMstrings.inputValue).value
            };
        },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            // 1. create html string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // 2. replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // 3. insert the html into DOM
            document.querySelector(element).insertAdjacentElement('beforeend', newHtml);
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

    };

    // Add item function 
    var ctrlAddItem = function() {
        var input, newItem, addItem;
        // get input data
        input = UIController.getInput();
        // add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // add the item to the UI
        addItem = UIController.addListItem(newItem, input.type);
        // 4. calculate the budget
        // 5. display the budget on UI

    };
    
    return {
        init: function() {
            console.log('application started');
            setupEventListners();
        }
    };
    

})(budgetController, UIController);

controller.init();