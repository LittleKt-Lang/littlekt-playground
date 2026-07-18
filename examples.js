/**
 * Built-in example programs for the LittleKt Playground.
 *
 * Each key is the display name shown in the Examples dropdown.
 * Each value is the LittleKt source code.
 */
export const examples = {
  'Hello World': `fun main(): Unit {
    println("Hello, LittleKt!")
    val name = "Playground"
    println("Welcome to the " + name + "!")
}

main()`,

  'Variables': `fun main(): Unit {
    // val = immutable, var = mutable
    val name: String = "LittleKt"
    var count: Int = 0

    count = count + 1
    println("Hello from " + name)
    println("Count: " + count)

    val pi: Double = 3.14159
    val flag: Boolean = true
    println("Pi: " + pi)
    println("Flag: " + flag)
}

main()`,

  'If / When': `fun main(): Unit {
    val x: Int = 42

    // if-else
    if (x > 10) {
        println("x is greater than 10")
    } else {
        println("x is small")
    }

    // when expression
    val color: String = "red"
    when (color) {
        "red"   -> println("Stop!")
        "green" -> println("Go!")
        else    -> println("Unknown")
    }

    // when without subject
    when {
        x < 0   -> println("negative")
        x == 0  -> println("zero")
        else    -> println("positive")
    }
}

main()`,

  'For & While': `fun main(): Unit {
    // for loop with range
    var sum: Int = 0
    for (i in 1..5) {
        sum = sum + i
    }
    println("Sum 1..5 = " + sum)

    // for loop over list
    val items: List = listOf("apple", "banana", "cherry")
    for (item in items) {
        println("Item: " + item)
    }

    // while loop
    var n: Int = 3
    while (n > 0) {
        println("Countdown: " + n)
        n = n - 1
    }
}

main()`,

  'Functions': `fun greet(name: String): Unit {
    println("Hello, " + name + "!")
}

fun add(a: Int, b: Int): Int {
    return a + b
}

// Recursion
fun factorial(n: Int): Int {
    if (n <= 1) { return 1 }
    return n * factorial(n - 1)
}

fun main(): Unit {
    greet("World")
    println("3 + 4 = " + add(3, 4))
    println("5! = " + factorial(5))
}

main()`,

  'Classes': `class Person(val name: String, val age: Int) {
    fun introduce(): Unit {
        println("Hi, I'm " + name + ", " + age + " years old")
    }
}

class Counter {
    var value: Int = 0

    init {
        println("Counter created!")
    }

    fun increment(): Unit {
        value = value + 1
    }
}

fun main(): Unit {
    val alice: Person = Person("Alice", 30)
    alice.introduce()

    val ctr: Counter = Counter()
    ctr.increment()
    ctr.increment()
    println("Counter: " + ctr.value)
}

main()`,

  'Collections': `fun main(): Unit {
    // Arrays
    val arr: Array = arrayOf(10, 20, 30)
    println("Array: " + arr[0] + ", " + arr[1] + ", " + arr[2])

    // Lists
    val list: List = listOf("a", "b", "c")
    println("List size: " + list.size)
    list.add("d")
    println("After add: " + list)

    // Maps
    val map: Map = mapOf("x" to 1, "y" to 2, "z" to 3)
    println("Map: " + map)

    // Higher-order functions
    val nums: List = listOf(1, 2, 3, 4, 5)
    val doubled: List = nums.map { it * 2 }
    println("Doubled: " + doubled)
}

main()`,

  'String Templates': `fun main(): Unit {
    val name: String = "LittleKt"
    val version: Int = 2

    println("Hello, " + name + "!")
    println("Version: " + version)
    println("Next: " + (version + 1))

    val items: List = listOf("a", "b", "c")
    println("Array size: " + items.size)
    println("Sum: " + (1 + 2 + 3))
}

main()`,

  'Nullable Types': `fun process(text: String?): Unit {
    if (text != null) {
        println("Got: " + text)
    } else {
        println("Got: nothing")
    }
}

fun main(): Unit {
    var name: String? = null
    println("name = " + name)

    name = "LittleKt"
    println("name = " + name)

    // Elvis operator
    val len: Int? = null
    val display: Int = len ?: 0
    println("display = " + display)

    process(null)
    process("hello")
}

main()`,

  'Try-Catch': `fun main(): Unit {
    // Basic try-catch
    try {
        println("Trying...")
        throw Exception("Something went wrong!")
    } catch (e: Exception) {
        println("Caught: " + e.message)
    } finally {
        println("Finally block")
    }

    // Try as expression
    val result: Int = try {
        10 + 20
    } catch (e: Exception) {
        0
    }
    println("Result: " + result)
}

main()`,

  'Lambdas': `fun main(): Unit {
    // Lambda with explicit param
    val square = { x -> x * x }
    println("square(5) = " + square(5))

    // List.map with lambda
    val nums: List = listOf(1, 2, 3, 4)
    val doubled: List = nums.map { n -> n * 2 }
    println("doubled = " + doubled)

    val evens: List = nums.filter { n -> (n % 2) == 0 }
    println("evens = " + evens)

    // Higher-order function
    val sum: Int = nums.fold(0, { acc, n -> acc + n })
    println("sum = " + sum)
}

main()`,

  'Raw Strings': `fun main(): Unit {
    val poem: String = """
        Roses are red,
        Violets are blue,
        LittleKt is fun,
        And so are you!
    """
    println(poem)

    val name: String = "World"
    val greeting: String = """
        Hello, \${name}!
        Welcome to raw strings.
    """
    println(greeting)
}

main()`,

  'Generics': `class Box<T>(val item: T) {
    fun get(): T {
        return item
    }
}

fun main(): Unit {
    val intBox = Box(42)
    println("intBox = " + intBox.get())

    val strBox = Box("hello")
    println("strBox = " + strBox.get())
}

main()`,

  'Inheritance': `open class Animal(val name: String) {
    fun speak(): Unit {
        println(name + " makes a sound")
    }
}

class Dog(name: String, val breed: String) : Animal(name) {
    fun bark(): Unit {
        println(name + " (" + breed + ") says woof!")
    }
}

fun main(): Unit {
    val dog: Dog = Dog("Buddy", "Golden Retriever")
    dog.speak()
    dog.bark()
    println("Name: " + dog.name)
    println("Breed: " + dog.breed)
}

main()`,
};
