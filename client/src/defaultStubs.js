const stubs = {};

stubs.cpp = `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    vector<int> arr(n);
    for(int i=0; i<n; i++) cin>>arr[i];
    
    for(auto num: arr) cout<<num<<" ";
    
    return 0;
}`;

// `#include <bits/stdc++.h>
// using namespace std;

// int main() {
//     cout << "Hello World!\\n";

//     vector<int> arr = {1, 2, 3, 4, 5};
//     for(auto num: arr) cout<<num<<" ";

//     return 0;
// }
// `

// `#include <iostream>
// using namespace std;

// int main() {
//     cout << "Hello World!";
//     return 0;
// }
// `;


stubs.py = `print("Hello World!")
`;

export default stubs;