const stubs = {};

stubs.cpp = `#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    vector<int> arr(n);
    for(int i=0; i<n; i++) cin>>arr[i];
    
    for(auto num: arr) cout<<num<<"\\n";
    
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


stubs.py = `def display_array_elements():
    size = int(input())
    array = []
    for i in range(size):
        element = int(input())
        array.append(element)
    print("Array elements:")
    for element in array:
        print(element)

# Call the function to display array elements
display_array_elements()
`;

export default stubs;