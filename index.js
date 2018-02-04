var app = new Vue({
  el: '#stock-app',
  data:{
    stocksLoaded: false,
    stocks_dict: {}
  },
  methods: {
    getStockData: function(){
      var ws = new WebSocket('ws://stocks.mnet.website');
      var vueObj = this;
      ws.onmessage = function (event){
        vueObj.stocksLoaded = true;
        var stock_data = eval(event.data), new_stocks = {};
        stock_data.forEach(function([name, price]){
          new_stocks[name] = price;
        });
        vueObj.createStockDictionary(new_stocks);
      }
    },

    createStockDictionary: function(new_stocks){
      var stock_dict = Object.assign({}, this.stocks_dict);
      //Loop to update Existing Stocks in stock_dict
      for (var name in stock_dict) {
        if(name in new_stocks){ // Check if new stock is availabel or not
          var prev_price = stock_dict[name]['price'] // Previous price
          if(prev_price > new_stocks[name]){ // Condition to check Stock price decreased or not
            stock_dict[name]['status'] = 'price-decreased';
          }else{
            stock_dict[name]['status'] = 'price-increased'; // or new price is same as existing price
          }
          stock_dict[name]['price'] = new_stocks[name];
          stock_dict[name]['last_update'] = Date.now();
          // After updating stock dictionary with new data remove that stock from new_stocks to prevent 
          // it adding again in dictionary in next loop
          delete new_stocks[name];
        }else{
          // If Stock is missing then keep existing price and updated_time as it is. 
          // Only change the status
          stock_dict[name]['status'] = 'stock-missing';
        }
      }

      // Loop to Add Only New Stocks in stock_dict
      for (var name in new_stocks) {
        stock_dict[name] = {};
        stock_dict[name]['price'] = new_stocks[name];
        stock_dict[name]['last_update'] = Date.now();
        stock_dict[name]['status'] = 'first-update';
      }
      this.stocks_dict = stock_dict;
    },

    getLastUpdateTime: function(updated_at){
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;
      var msPerYear = msPerDay * 365;
      var current = Date.now();
      var elapsed = current - updated_at;

      if (elapsed < msPerMinute){
        return moment(updated_at).fromNow(); 
      }else if (elapsed < msPerDay){
        return moment(updated_at).format('LT'); 
      }else if (elapsed < msPerYear){
        return moment(updated_at).format("D MMM, h:m A");  
      }else {
        return moment(updated_at).format("D MMM YY, h:m A");  
      }
    }
  },
  beforeMount(){
    this.getStockData();
  },
  filters: {
    capitalize: function (value){
      if (!value) return ''
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
    
    roundoff: function(value){
      if (!value) return '';
      value = Number(value);
      return value.toFixed(2);
    }
  }
})

